import * as core from '@actions/core'
import {bump} from './bump'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    const newVersion = bump('1.0.0')

    core.setOutput('newVersion', newVersion)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
