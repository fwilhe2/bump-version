import * as httpm from '@actions/http-client'
import {env} from 'process'

type BumpComponent = 'major' | 'minor' | 'patch'

export function isBumpComponent(val: string): val is BumpComponent {
  return ['major', 'minor', 'patch'].includes(val)
}

export async function currentVersion(): Promise<string> {
  const httpClient = new httpm.HttpClient('bump-version')
  const response = await httpClient.get(
    `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/releases/latest`
  )
  const body = await response.readBody()
  const obj = JSON.parse(body)
  const tagName = obj.tag_name
  return tagName
}

/**
 * Bumps the specified component of a version string while preserving
 * its 'v' prefix and segment count.
 */
export function bump(version: string, component: BumpComponent): string {
  const hasVPrefix = version.startsWith('v')
  const numericPart = hasVPrefix ? version.slice(1) : version

  // Split into segments (e.g., ["1", "0", "0"])
  const segments = numericPart.split('.').map(Number)

  // Mapping component to array index
  const componentMap: Record<BumpComponent, number> = {
    major: 0,
    minor: 1,
    patch: 2
  }

  const index = componentMap[component]

  // Logic: Increment the target segment, then zero out all segments to the right
  if (segments[index] !== undefined) {
    segments[index]++
    for (let i = index + 1; i < segments.length; i++) {
      segments[i] = 0
    }
  }

  const result = segments.join('.')
  return hasVPrefix ? `v${result}` : result
}
