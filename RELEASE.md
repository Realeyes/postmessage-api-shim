# Release process

* Use gitflow release or hotfix branch to prepare a release.
* First commit in a release or hotfix branch should bump the version in package.json. `npm version z.y.z`
* Use `followTags = true` when pushing a release.
* `npm publish --access public` from master branch after a release.
