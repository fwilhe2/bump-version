Example for running the action manually inside a dev container:

```
/workspaces/bump-version (main *)$ INPUT_COMPONENT=minor node dist/index.js

::set-output name=newVersion::0.2.0
/workspaces/bump-version (main *)$ INPUT_COMPONENT=patch node dist/index.js

::set-output name=newVersion::0.1.5
```
