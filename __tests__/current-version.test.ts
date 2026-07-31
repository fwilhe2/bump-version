import * as httpm from '@actions/http-client'
import {currentVersion} from '../src/bump'
import {afterEach, beforeEach, expect, jest, test} from '@jest/globals'

type Reply = {
  statusCode: number
  body: string
  headers?: {[key: string]: string}
}

/**
 * Replaces the http client with one that answers every request with the
 * given reply, so that the tests do not depend on the GitHub API.
 */
function respondWith(reply: Reply) {
  return jest.spyOn(httpm.HttpClient.prototype, 'get').mockResolvedValue({
    message: {statusCode: reply.statusCode, headers: reply.headers ?? {}},
    readBody: async () => reply.body
  } as unknown as httpm.HttpClientResponse)
}

const release = JSON.stringify({tag_name: 'v1.2.3'})

beforeEach(() => {
  process.env['GITHUB_REPOSITORY'] = 'fwilhe2/bump-version'
  delete process.env['GITHUB_API_URL']
})

afterEach(() => {
  jest.restoreAllMocks()
})

test('Reads the tag name of the latest release', async () => {
  respondWith({statusCode: 200, body: release})

  expect(await currentVersion()).toEqual('v1.2.3')
})

test('Queries the latest release of the current repository', async () => {
  const get = respondWith({statusCode: 200, body: release})

  await currentVersion()

  expect(get).toHaveBeenCalledWith(
    'https://api.github.com/repos/fwilhe2/bump-version/releases/latest',
    expect.anything()
  )
})

test('Queries the API host of the current environment', async () => {
  process.env['GITHUB_API_URL'] = 'https://github.example.com/api/v3'
  const get = respondWith({statusCode: 200, body: release})

  await currentVersion()

  expect(get).toHaveBeenCalledWith(
    'https://github.example.com/api/v3/repos/fwilhe2/bump-version/releases/latest',
    expect.anything()
  )
})

test('Sends the token when one is given', async () => {
  const get = respondWith({statusCode: 200, body: release})

  await currentVersion('s3cret')

  expect(get.mock.calls[0][1]).toMatchObject({
    authorization: 'Bearer s3cret',
    accept: 'application/vnd.github+json'
  })
})

test('Sends no authorization header without a token', async () => {
  const get = respondWith({statusCode: 200, body: release})

  await currentVersion()

  expect(get.mock.calls[0][1]).not.toHaveProperty('authorization')
})

test('Fails without a repository', async () => {
  delete process.env['GITHUB_REPOSITORY']

  await expect(currentVersion()).rejects.toThrow('GITHUB_REPOSITORY is not set')
})

test('Explains a missing release', async () => {
  respondWith({statusCode: 404, body: JSON.stringify({message: 'Not Found'})})

  await expect(currentVersion()).rejects.toThrow(
    'No latest release found for fwilhe2/bump-version'
  )
})

test('Explains an exhausted rate limit', async () => {
  respondWith({
    statusCode: 403,
    body: JSON.stringify({message: 'API rate limit exceeded'}),
    headers: {'x-ratelimit-remaining': '0'}
  })

  await expect(currentVersion()).rejects.toThrow(
    'Rate limit exceeded while querying'
  )
})

test('Reports a rejected token', async () => {
  respondWith({
    statusCode: 401,
    body: JSON.stringify({message: 'Bad credentials'}),
    headers: {'x-ratelimit-remaining': '59'}
  })

  await expect(currentVersion('wrong')).rejects.toThrow(
    'was rejected with status 401. Bad credentials'
  )
})

test('Reports an unexpected status code', async () => {
  respondWith({statusCode: 500, body: JSON.stringify({message: 'Boom'})})

  await expect(currentVersion()).rejects.toThrow('failed with status 500. Boom')
})

test('Reports an unexpected status code with an unreadable body', async () => {
  respondWith({statusCode: 502, body: '<html>bad gateway</html>'})

  await expect(currentVersion()).rejects.toThrow('failed with status 502.')
})

test('Reports a response that is not JSON', async () => {
  respondWith({statusCode: 200, body: 'not json'})

  await expect(currentVersion()).rejects.toThrow('as JSON')
})

test('Reports a release without a tag name', async () => {
  respondWith({statusCode: 200, body: JSON.stringify({name: 'Release 1.2.3'})})

  await expect(currentVersion()).rejects.toThrow('has no tag name')
})
