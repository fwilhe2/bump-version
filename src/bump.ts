import * as httpm from '@actions/http-client'
import {env} from 'process'

type BumpComponent = 'major' | 'minor' | 'patch'

const COMPONENTS: BumpComponent[] = ['major', 'minor', 'patch']

export function isBumpComponent(val: string): val is BumpComponent {
  return (COMPONENTS as string[]).includes(val)
}

/**
 * Looks up the tag name of the latest release of the repository the action
 * runs in. A token is used when given, which is required for private
 * repositories and raises the rate limit for public ones.
 */
export async function currentVersion(token?: string): Promise<string> {
  const repository = env.GITHUB_REPOSITORY
  if (!repository) {
    throw new Error(
      'GITHUB_REPOSITORY is not set, cannot determine which repository to query.'
    )
  }

  // GITHUB_API_URL points at the GitHub Enterprise Server API when the action
  // does not run on github.com.
  const apiUrl = env.GITHUB_API_URL ?? 'https://api.github.com'
  const url = `${apiUrl}/repos/${repository}/releases/latest`

  const headers: {[key: string]: string} = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28'
  }
  if (token) {
    headers.authorization = `Bearer ${token}`
  }

  const httpClient = new httpm.HttpClient('bump-version')
  const response = await httpClient.get(url, headers)
  const body = await response.readBody()
  const statusCode = response.message.statusCode ?? 0

  if (statusCode === 404) {
    throw new Error(
      `No latest release found for ${repository}. Either the repository has no ` +
        'published release yet, or it is private and the token is missing or ' +
        'lacks the contents: read permission.'
    )
  }

  if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
    const remaining = response.message.headers['x-ratelimit-remaining']
    const rateLimited = remaining === '0'
    throw new Error(
      rateLimited
        ? `Rate limit exceeded while querying ${url}. Pass a token to raise the limit.`
        : `Request to ${url} was rejected with status ${statusCode}. ${describe(body)}`
    )
  }

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(
      `Request to ${url} failed with status ${statusCode}. ${describe(body)}`
    )
  }

  let tagName: unknown
  try {
    tagName = JSON.parse(body).tag_name
  } catch {
    throw new Error(`Could not parse the response of ${url} as JSON.`)
  }

  if (typeof tagName !== 'string' || tagName === '') {
    throw new Error(`The latest release of ${repository} has no tag name.`)
  }

  return tagName
}

function describe(body: string): string {
  try {
    const message = JSON.parse(body).message
    return typeof message === 'string' ? message : ''
  } catch {
    return ''
  }
}

/**
 * Bumps the specified component of a version string while preserving
 * its 'v' prefix and segment count.
 *
 * A version carrying a qualifier such as 1.0.0-SNAPSHOT or 1.0.0-rc1 is the
 * pre-release of 1.0.0, so the qualifier is stripped and no component is
 * incremented.
 *
 * Throws when the version cannot be parsed, or when it is too short to hold
 * the requested component, e.g. the patch component of '1.0'.
 */
export function bump(version: string, component: BumpComponent): string {
  if (typeof version !== 'string' || version.trim() === '') {
    throw new Error(`Cannot bump an empty version.`)
  }

  const hasVPrefix = version.startsWith('v')
  const prefix = hasVPrefix ? 'v' : ''
  const withoutPrefix = hasVPrefix ? version.slice(1) : version

  // Split off a pre-release qualifier ('-rc1') or build metadata ('+build.5').
  const qualifierStart = withoutPrefix.search(/[-+]/)
  const hasQualifier = qualifierStart !== -1
  const numericPart = hasQualifier
    ? withoutPrefix.slice(0, qualifierStart)
    : withoutPrefix

  const segments = numericPart.split('.')
  if (!segments.every(segment => /^\d+$/.test(segment))) {
    throw new Error(
      `Cannot parse '${version}' as a version number, expected digits separated by dots.`
    )
  }

  // A pre-release is bumped by releasing it, 1.0.0-SNAPSHOT becomes 1.0.0.
  if (hasQualifier) {
    return `${prefix}${numericPart}`
  }

  const index = COMPONENTS.indexOf(component)
  if (index >= segments.length) {
    throw new Error(
      `Cannot bump the ${component} component of '${version}', it only has ${segments.length} component(s).`
    )
  }

  const numbers = segments.map(Number)
  numbers[index]++
  for (let i = index + 1; i < numbers.length; i++) {
    numbers[i] = 0
  }

  return `${prefix}${numbers.join('.')}`
}
