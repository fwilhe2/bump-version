import {bump, currentVersion} from '../src/bump'
import * as process from 'process'
import {expect, test} from '@jest/globals'

test('Get current version of repo', async () => {
  process.env['GITHUB_REPOSITORY'] = 'fw-scratch/bump-version-test-v0.0.0'

  const actual = await currentVersion()
  expect(actual).toEqual('v0.1.0')
})

test('Get current version of repo2', async () => {
  process.env['GITHUB_REPOSITORY'] = 'fw-scratch/bump-version-test-0.0.0'

  const actual = await currentVersion()
  expect(actual).toEqual('0.1.0')
})

test('Bump semantic three digit version', async () => {
  const actual = bump('1.0.0', 'patch')
  expect(actual).toEqual('1.0.1')
})

test('Bump minor semantic three digit version', async () => {
  const actual = bump('1.2.3', 'minor')
  expect(actual).toEqual('1.3.0')
})

test('Bump semantic three digit version with v prefix', async () => {
  const actual = bump('v1.0.0', 'patch')
  expect(actual).toEqual('v1.0.1')
})

test('Bump semantic three digit version with v prefix major', async () => {
  const actual = bump('v1.0.0', 'major')
  expect(actual).toEqual('v2.0.0')
})

test('Bump minor semantic three digit version with v prefix', async () => {
  const actual = bump('v1.2.3', 'minor')
  expect(actual).toEqual('v1.3.0')
})

test('Bump semantic two digit version', async () => {
  const actual = bump('1.0', 'minor')
  expect(actual).toEqual('1.1')
})

test('Bump semantic two digit version with v prefix', async () => {
  const actual = bump('v1.0', 'minor')
  expect(actual).toEqual('v1.1')
})

test('Bump single digit version', async () => {
  const actual = bump('1', 'major')
  expect(actual).toEqual('2')
})

test('Bump single digit version with v prefix', async () => {
  const actual = bump('v1', 'major')
  expect(actual).toEqual('v2')
})
