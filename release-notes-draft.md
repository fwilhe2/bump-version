# New Features

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
