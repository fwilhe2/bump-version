import * as core from '@actions/core'

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

export function bump(version: string, component: string): string {
  const components = ['major', 'minor', 'patch']

  const elements = version.split('.')
  const indexOfElementToUpdate = components.indexOf(component)

  if (indexOfElementToUpdate < 0) {
    core.setFailed(
      `Provided version component (${component}) is not one of 'major', 'minor', 'patch'.`
    )
  }

  if (indexOfElementToUpdate >= elements.length) {
    core.setFailed(
      `Provided version component (${component}) is not part of the provided version (${version}).`
    )
  }

  const currentVersionFragment = Number(elements[indexOfElementToUpdate])
  elements[indexOfElementToUpdate] = String(currentVersionFragment + 1)

  // set all components after the updated component to zero
  // if we bump minor version of "1.2.3", the next version is "1.3.0", not "1.3.3"
  for (let i = indexOfElementToUpdate + 1; i < elements.length; i++) {
    elements[i] = '0'
  }

  return elements.join('.')
}
