
# Changes

## Configure version component via `workflow_dispatch`

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
