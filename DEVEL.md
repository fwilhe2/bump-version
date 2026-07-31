# Development

`npm run all` formats, lints, tests and bundles the action.

The bundled `dist/index.js` is committed, since that is what the runner executes.
The `check-dist` workflow rebuilds it and fails when the committed bundle is out of date, so run `npm run bundle` after changing anything in `src`.

## Releasing

The `Release` workflow is triggered manually, creates a release with the next version number, and moves the branch of that major version to the released commit.
Users reference the action as `fwilhe2/bump-version@v2`, so that branch has to keep pointing at the newest release of its line.

Anything that can fail a workflow which worked before is a breaking change and belongs into a new major version, including a change of the Node.js version the action runs on, since self hosted runners may not have the new one.
Cut the new line by creating its first tag and branch by hand, `v3.0` and `v3`, and leave the previous major branch where it is.
See [fwilhe2/setup-kotlin#651](https://github.com/fwilhe2/setup-kotlin/issues/651) for how this bites users when it is not done.

Release tags carry a `v` prefix and two components, `v2.0`, `v2.1`, and so on, which is why the workflow defaults to incrementing the `minor` component.
A version of that shape has no `patch` component, and asking for one fails.

## Running the action manually

Inputs are passed as `INPUT_<NAME>` environment variables, the repository to look up as `GITHUB_REPOSITORY`, and outputs are written to the file `GITHUB_OUTPUT` points at.

```
$ export GITHUB_OUTPUT=$(mktemp)
$ INPUT_COMPONENT=minor GITHUB_REPOSITORY=fwilhe2/bump-version node dist/index.js
$ cat $GITHUB_OUTPUT
newVersion<<ghadelimiter_1a81aca3-46d8-458e-9b3c-a8429a800f3a
1.1.0
ghadelimiter_1a81aca3-46d8-458e-9b3c-a8429a800f3a
```

Without `GITHUB_OUTPUT` the runner is not simulated closely enough and `@actions/core` falls back to the `::set-output` workflow command, which GitHub removed in 2023.

Alternatively `npm run local-action` runs `src/main.ts` through [`@github/local-action`](https://github.com/github/local-action), which reads the inputs from a `.env` file.
