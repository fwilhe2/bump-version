import * as core from '@actions/core'
import * as h from '@actions/http-client'
import {bump} from './bump'

async function run(): Promise<void> {
  try {
    const repo: string = core.getInput('repo')

    const _h = new h.HttpClient('foobar')
    const response = await _h.get(
      `https://api.github.com/repos/${repo}/releases/latest`
    )
    const body = await response.readBody()
    const obj: any = JSON.parse(body)
    const currentVersion = obj.tag_name
    const newVersion = bump(currentVersion)

    core.setOutput('newVersion', newVersion)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
