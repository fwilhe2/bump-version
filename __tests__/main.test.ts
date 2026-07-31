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

test('Bump patch on a single digit version fails', () => {
  // If the shape must be preserved, we can't add a .0.1 if it wasn't there
  expect(() => bump('1', 'patch')).toThrow(
    "Cannot bump the patch component of '1', it only has 1 component(s)."
  )
})

test('Bump patch on a two digit version fails', () => {
  expect(() => bump('1.0', 'patch')).toThrow(
    "Cannot bump the patch component of '1.0', it only has 2 component(s)."
  )
})

test('Bump minor on a single digit version fails', () => {
  expect(() => bump('1', 'minor')).toThrow(
    "Cannot bump the minor component of '1', it only has 1 component(s)."
  )
})

test('Bump major with multi-digit numbers', () => {
  const actual = bump('9.10.11', 'major')
  expect(actual).toEqual('10.0.0')
})

test('Bump minor on a version with large patch', () => {
  const actual = bump('1.9.999', 'minor')
  expect(actual).toEqual('1.10.0')
})

test('Bump version starting at 0', () => {
  const actual = bump('0.0.1', 'major')
  expect(actual).toEqual('1.0.0')
})

test('Bump a snapshot version releases it', () => {
  const actual = bump('1.0.0-SNAPSHOT', 'minor')
  expect(actual).toEqual('1.0.0')
})

test('Bump a release candidate releases it', () => {
  const actual = bump('1.2.3-rc1', 'patch')
  expect(actual).toEqual('1.2.3')
})

test('Bump a two digit dev version with v prefix releases it', () => {
  const actual = bump('v1.0-dev', 'minor')
  expect(actual).toEqual('v1.0')
})

test('Bump a version with build metadata strips the metadata', () => {
  const actual = bump('1.2.3+build.5', 'patch')
  expect(actual).toEqual('1.2.3')
})

test('Bump a non numeric version fails', () => {
  expect(() => bump('not-a-version', 'minor')).toThrow(
    "Cannot parse 'not-a-version' as a version number"
  )
})

test('Bump a version with a non numeric segment fails', () => {
  expect(() => bump('1.x.0', 'minor')).toThrow(
    "Cannot parse '1.x.0' as a version number"
  )
})

test('Bump an empty version fails', () => {
  expect(() => bump('', 'major')).toThrow('Cannot bump an empty version.')
})

test('Bump a bare v prefix fails', () => {
  expect(() => bump('v', 'major')).toThrow(
    "Cannot parse 'v' as a version number"
  )
})

test('Current version without a repository fails', async () => {
  delete process.env['GITHUB_REPOSITORY']

  await expect(currentVersion()).rejects.toThrow('GITHUB_REPOSITORY is not set')
})
