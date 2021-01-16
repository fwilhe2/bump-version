# Bump Version

Gets the latest release version and increases it, useful for automatic releases.

Example:

```yaml
    - uses: fwilhe2/bump-version@main
      id: bump
    - run: echo ${{ steps.bump.outputs.newVersion }}

    - uses: actions/create-release@v1
      with:
        tag_name: ${{ steps.bump.outputs.newVersion }}
```

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

## License

This software is released under the MIT License (MIT), see [LICENSE](./LICENSE) for details.

