# Bump Version

Gets the latest release version and increases it, useful for automatic releases.

## Examples

### Example workflow to release a new version with auto-incrementing version number

```yaml
name: Release
on:
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v6
      - name: Get Version Number
        uses: fwilhe2/bump-version@v2
        id: bump
      - run: echo New Version Number ${{ steps.bump.outputs.newVersion }}
      - name: Create Release
        run: |
          gh release create ${{ steps.bump.outputs.newVersion }} --title "Release ${{ steps.bump.outputs.newVersion }}" --generate-notes
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Update a specific version component

You can select the version component to update.
By default, the `minor` version is updated.
Valid values are `major`, `minor`, `patch`.

Example to update the `patch` version:

```yaml
- uses: fwilhe2/bump-version@v2
  id: bump
  with:
    component: patch
- run: echo ${{ steps.bump.outputs.newVersion }}
```

### Configure version component via `workflow_dispatch`

If you want to select a version number component to update when triggering a release via `workflow_dispatch`, you might want to use [inputs](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/) as in this example.

```yaml
on:
  workflow_dispatch:
    inputs:
      component:
        description: 'Version component to increment'
        required: true
        default: 'patch'
jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v6
      - name: Get Version Number
        uses: fwilhe2/bump-version@v2
        id: bump
        with:
          component: ${{ github.event.inputs.component }}
```

### Private repositories and GitHub Enterprise Server

The action reads the latest release through the GitHub API.
It uses `${{ github.token }}` by default, which is enough for private repositories as long as the job grants `contents: read`.
Pass a different token via the `token` input if you need to.

```yaml
- uses: fwilhe2/bump-version@v2
  id: bump
  with:
    token: ${{ secrets.MY_TOKEN }}
```

The API host is taken from `GITHUB_API_URL`, so the action works on GitHub Enterprise Server without configuration.

## Behaviour

The version number of the latest release is taken as it is, including a `v` prefix if present, and the requested component is incremented.
Components to the right of it are set to zero, so bumping the minor component of `v1.2.3` yields `v1.3.0`.

A pre-release version is bumped by releasing it: the qualifier is dropped and no number is incremented, so `1.0.0-SNAPSHOT` and `1.0.0-rc1` both become `1.0.0`.

The action fails with an error message when

- the latest release cannot be read, for example because the repository has no release yet or the token is missing,
- the tag of the latest release is not a version number, or
- the version is too short to hold the requested component, for example the `patch` component of `1.0`.

## Versioning

Reference the action by its major version branch, `@v3`, which points at the most recent release of that line and receives compatible changes automatically.
Pin a release tag such as `@v3.0.0` to stay on an exact version, or a commit sha if you want to be strict about it.

Breaking changes go into a new major version, so `@v2` keeps behaving the way it did before the change.

| version | notes                                                                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@v3`   | validates version numbers, releases pre-releases such as `1.0.0-SNAPSHOT`, authenticates against the API, and fails instead of returning a version it could not bump |
| `@v2`   | same as `@v3`, kept for the tags cut during the 2.x line                                                                                                             |
| `@v1`   | last release of the 1.x line, unmaintained                                                                                                                           |

## License

This software is released under the MIT License (MIT), see [LICENSE](./LICENSE) for details.
