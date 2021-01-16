import {bump, currentVersion} from '../src/bump'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

test('Get current version of repo', async () => {
  process.env['GITHUB_REPOSITORY'] = 'fw-scratch/bump-version-test-v0.0.0'

  const actual = await currentVersion()
  expect(actual).toEqual('v0.0.2')
})

test('Get current version of repo2', async () => {
  process.env['GITHUB_REPOSITORY'] = 'fw-scratch/bump-version-test-0.0.0'

  const actual = await currentVersion()
  expect(actual).toEqual('0.0.2')
})

test('Bump semantic three digit version', async () => {
  const actual = bump('1.0.0')
  expect(actual).toEqual('1.0.1')
})

test('Bump semantic three digit version with v prefix', async () => {
  const actual = bump('v1.0.0')
  expect(actual).toEqual('v1.0.1')
})

test('Bump semantic two digit version', async () => {
  const actual = bump('1.0')
  expect(actual).toEqual('1.1')
})

test('Bump semantic two digit version with v prefix', async () => {
  const actual = bump('v1.0')
  expect(actual).toEqual('v1.1')
})

test('Bump single digit version', async () => {
  const actual = bump('1')
  expect(actual).toEqual('2')
})

// not yet implemented
// test('Bump single digit version with v prefix', async () => {
//   const actual = bump('v1')
//   expect(actual).toEqual('v2')
// })

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['GITHUB_REPOSITORY'] = 'fw-scratch/bump-version-test-v0.0.0'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
