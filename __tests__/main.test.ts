import {bump, currentVersion} from '../src/bump'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

// test('throws invalid number', async () => {
//   const input = parseInt('foo', 10)
//   await expect(wait(input)).rejects.toThrow('milliseconds not a number')
// })

test('Get current version of repo', async () => {
  process.env['GITHUB_REPOSITORY'] = 'fwilhe2/ideal-journey'

  const actual = await currentVersion()
  expect(actual).toEqual('0.0.1')
})

test('Bump semantic version', async () => {
  const actual = bump('1.0.0')
  expect(actual).toEqual('1.0.1')
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['GITHUB_REPOSITORY'] = 'fwilhe2/ideal-journey'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
