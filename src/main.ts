import * as core from '@actions/core'
import {bump, currentVersion} from './bump'

async function run(): Promise<void> {
  try {
    const component = core.getInput('component')
    const versionBefore = await currentVersion()
    const newVersion = bump(versionBefore, component)

    await core.summary
      .addHeading('Bump Version Summary :up:')
      .addRaw(`Old Version: ${versionBefore}`, true)
      .addRaw(`New Version: ${newVersion}`, true)
      .write()

    core.setOutput('newVersion', newVersion)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
