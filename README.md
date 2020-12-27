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
