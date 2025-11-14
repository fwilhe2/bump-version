# Bump Version

Gets the latest release version and increases it, useful for automatic releases.

## Examples

### Example workflow to release a new version with auto-incrementing version number

```yaml
    - name: Get Version Number
      uses: fwilhe2/bump-version@main
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
    - uses: fwilhe2/bump-version@main
      id: bump
      with:
        component: patch
    - run: echo ${{ steps.bump.outputs.newVersion }}
```

### Configure version component via `workflow_dispatch`

If you want to select a version number component to update when triggering a release via `workflow_dispatch`, you might want to use [inputs](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/) as in this example.

```yaml
on:
  push:
  workflow_dispatch:
    inputs:
      component:
        description: 'Version component to increment'
        required: true
        default: 'patch'
jobs:
  build:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2
    - name: Get Version Number
      uses: fwilhe2/bump-version@main
      id: bump
      with:
        component: ${{ github.event.inputs.component }}
```

## License

This software is released under the MIT License (MIT), see [LICENSE](./LICENSE) for details.
