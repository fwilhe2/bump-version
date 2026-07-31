import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as httpm from '@actions/http-client'
import {run} from '../src/main'
import {afterEach, beforeEach, expect, jest, test} from '@jest/globals'

let outputFile: string
let errors: string[]
let exitCodeBefore: number | string | undefined

/**
 * Runs the action against a fake latest release and returns what it wrote to
 * the output file, in the same way the runner would read it.
 */
async function runWith(inputs: {[key: string]: string}, tagName = 'v1.2.3') {
  jest.spyOn(httpm.HttpClient.prototype, 'get').mockResolvedValue({
    message: {statusCode: 200, headers: {}},
    readBody: async () => JSON.stringify({tag_name: tagName})
  } as unknown as httpm.HttpClientResponse)

  for (const [name, value] of Object.entries(inputs)) {
    process.env[`INPUT_${name.toUpperCase()}`] = value
  }

  await run()

  return fs.readFileSync(outputFile, 'utf8')
}

beforeEach(() => {
  outputFile = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'bump-version-')),
    'output'
  )
  fs.writeFileSync(outputFile, '')
  process.env['GITHUB_OUTPUT'] = outputFile
  process.env['GITHUB_REPOSITORY'] = 'fwilhe2/bump-version'
  delete process.env['INPUT_COMPONENT']
  delete process.env['INPUT_TOKEN']

  errors = []
  jest.spyOn(process.stdout, 'write').mockImplementation(line => {
    if (String(line).startsWith('::error::')) errors.push(String(line).trim())
    return true
  })

  // setFailed sets the exit code of the whole process, which would fail the
  // test run itself.
  exitCodeBefore = process.exitCode
})

afterEach(() => {
  jest.restoreAllMocks()
  process.exitCode = exitCodeBefore
  fs.rmSync(path.dirname(outputFile), {recursive: true, force: true})
})

test('Writes the bumped version to the output', async () => {
  const output = await runWith({component: 'minor'})

  expect(output).toContain('newVersion')
  expect(output).toContain('v1.3.0')
  expect(process.exitCode).not.toBe(1)
})

test('Bumps the component that was asked for', async () => {
  expect(await runWith({component: 'major'})).toContain('v2.0.0')
  expect(await runWith({component: 'patch'})).toContain('v1.2.4')
})

test('Releases a pre-release of the latest release', async () => {
  expect(await runWith({component: 'minor'}, '2.0.0-SNAPSHOT')).toContain(
    '2.0.0'
  )
})

test('Fails on an unknown component', async () => {
  const output = await runWith({component: 'bogus'})

  expect(errors).toEqual([
    '::error::Invalid component: bogus. Use major, minor, or patch.'
  ])
  expect(output).toEqual('')
  expect(process.exitCode).toBe(1)
})

test('Fails when the version cannot be bumped', async () => {
  const output = await runWith({component: 'patch'}, '1.0')

  expect(errors).toEqual([
    "::error::Cannot bump the patch component of '1.0', it only has 2 component(s)."
  ])
  expect(output).toEqual('')
  expect(process.exitCode).toBe(1)
})

test('Fails when the latest release cannot be read', async () => {
  jest.spyOn(httpm.HttpClient.prototype, 'get').mockResolvedValue({
    message: {statusCode: 404, headers: {}},
    readBody: async () => JSON.stringify({message: 'Not Found'})
  } as unknown as httpm.HttpClientResponse)
  process.env['INPUT_COMPONENT'] = 'minor'

  await run()

  expect(errors[0]).toContain(
    'No latest release found for fwilhe2/bump-version'
  )
  expect(process.exitCode).toBe(1)
})
