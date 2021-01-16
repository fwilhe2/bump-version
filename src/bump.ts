import * as httpm from '@actions/http-client'
import {env} from 'process'

export async function currentVersion(): Promise<string> {
  const httpClient = new httpm.HttpClient('bump-version')
  const response = await httpClient.get(
    `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/releases/latest`
  )
  const body = await response.readBody()
  const obj: any = JSON.parse(body)
  const tagName = obj.tag_name
  return tagName
}

export function bump(version: string): string {
  const elements = version.split('.')
  const indexOfLastElement = elements.length - 1
  const currentVersionFragment = Number(elements[indexOfLastElement])
  elements[indexOfLastElement] = String(currentVersionFragment + 1)
  return elements.join('.')
}
