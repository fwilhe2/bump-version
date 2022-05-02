import * as core from '@actions/core'
import {bump, currentVersion} from './bump'

async function run(): Promise<void> {
  try {
    const component = core.getInput('component')
    const newVersion = bump(await currentVersion(), component)

    core.setOutput('newVersion', newVersion)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
