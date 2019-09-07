# git-repo-is-up-to-date

Check if a git repo exactly matches what is in the remote branch

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [gitRepoIsUpToDateReturnObject](#gitrepoisuptodatereturnobject)
    -   [Properties](#properties)
-   [gitRepoIsUpToDate](#gitrepoisuptodate)
    -   [Parameters](#parameters)

### gitRepoIsUpToDateReturnObject

[index.js:27-74](https://github.com/ibi-group/git-repo-is-up-to-date/blob/c2053e7209cb57f917ea94bb8a30476d39a98a61/index.js#L7-L18 "Source code on GitHub")

The return object of the gitRepoIsUpToDate function.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `baseCommit` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The commit hash of the merge base commit
-   `errors` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** A list of all
-   `isUpToDate` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if the repo is up to date
-   `localCommit` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The commit hash of the local commit
-   `remoteCommit` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The commit hash of the remote commit
-   `remoteUrl` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The url for the remote repository
-   `repoInfo` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** The output of the `git-repo-info` package

### gitRepoIsUpToDate

[index.js:27-74](https://github.com/ibi-group/git-repo-is-up-to-date/blob/c2053e7209cb57f917ea94bb8a30476d39a98a61/index.js#L27-L74 "Source code on GitHub")

Check if a given folder is a git repository where the contents exactly match
what is in the remote branch of the repository.

#### Parameters

-   `folder` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** A path to a file or directory (optional, default `process.cwd()`)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[gitRepoIsUpToDateReturnObject](#gitrepoisuptodatereturnobject)>** 
