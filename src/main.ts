import * as core from '@actions/core'
import {bump, currentVersion} from './bump'

async function run(): Promise<void> {
  try {
    const newVersion = bump(await currentVersion())

    core.setOutput('newVersion', newVersion)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
