
## Improve error handling

When an invalid version component should be updated, the action will fail.
Invalid components are either none of `major`, `minor`, `patch`, or are not present in the versioning schema (version `1.0` has no `patch` component).

## Handle non-release qualifiers

Non-release version qualifiers (suffixes to version numbers such as `-dev`, `-SNAPSHOT`, `-RC`) are handled now in a way where the suffix is removed, but the version number is not increased.
This means the next version after `1.0.0-something` is `1.0.0`, regardless of the version component.
