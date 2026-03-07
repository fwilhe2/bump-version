import * as core from '@actions/core'
import {bump, currentVersion, isBumpComponent} from './bump'

async function run(): Promise<void> {
  try {
    const component = core.getInput('component')

    if (isBumpComponent(component)) {
      const newVersion = bump(await currentVersion(), component)
      core.setOutput('newVersion', newVersion)
    } else {
      core.setFailed(
        `Invalid component: ${component}. Use major, minor, or patch.`
      )
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
