# Development

`npm run all` formats, lints, tests and bundles the action.

The bundled `dist/index.js` is committed, since that is what the runner executes.
The `check-dist` workflow rebuilds it and fails when the committed bundle is out of date, so run `npm run bundle` after changing anything in `src`.

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
