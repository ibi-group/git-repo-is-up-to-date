const execa = require('execa')
const origin = require('git-remote-origin-url')
const gitRepoInfo = require('git-repo-info')

const {failWithError} = require('./util')

/**
 * The return object of the gitRepoIsUpToDate function.
 *
 * @typedef {Object} gitRepoIsUpToDateReturnObject
 * @property {string} baseCommit The commit hash of the merge base commit
 * @property {Array<string>} errors A list of all errors that occured if there are any
 * @property {boolean} isUpToDate true if the repo is up to date
 * @property {string} localCommit The commit hash of the local commit
 * @property {string} remoteCommit The commit hash of the remote commit
 * @property {string} remoteUrl The url for the remote repository
 * @property {Object} repoInfo The output of the `git-repo-info` package
 */

/**
 * Return a promise with the result of checking if a given folder is a git
 * repository where the contents exactly match what is in the remote branch of
 * the repository.
 *
 * @param  {string}  [folder=process.cwd()] A path to a file or directory
 * @return {Promise<gitRepoIsUpToDateReturnObject>}
 */
async function gitRepoIsUpToDate (folder = process.cwd()) {
  let remoteUrl, repoInfo
  try {
    repoInfo = gitRepoInfo(folder)
    remoteUrl = await origin(folder)
  } catch (e) {
    return failWithError(e, { remoteUrl, repoInfo })
  }

  const repoRoot = repoInfo.root
  const errors = []

  // run some git commands to make sure repo is up to date
  // modified from https://stackoverflow.com/a/3278427/269834
  let baseCommit, localCommit, remoteCommit
  try {
    const localResult = await execa('git', ['-C', repoRoot, 'rev-parse', '@'])
    localCommit = localResult.stdout
  } catch (e) {
    return failWithError(
      `Coud not determine local commit for ${repoRoot} due to error: ${e}`,
      { baseCommit, localCommit, remoteCommit, remoteUrl, repoInfo }
    )
  }

  try {
    const remoteResult = await execa('git', ['-C', repoRoot, 'rev-parse', '@{u}'])
    const baseResult = await execa('git', ['-C', repoRoot, 'merge-base', '@', '@{u}'])
    remoteCommit = remoteResult.stdout
    baseCommit = baseResult.stdout
  } catch (e) {
    // Get branch for error message
    let branch
    try {
      const {stdout: branches} = await execa('git', ['-C', repoRoot, 'branch'])
      branch = branches.split('* ')[1].split('\n')[0]
    } catch (e) {
      return failWithError(
        `No upstream configured for branch. Encountered an error while trying to find branch name: ${e}`,
        { baseCommit, localCommit, remoteCommit, remoteUrl, repoInfo }
      )
    }
    return failWithError(
      `No upstream configured for branch. May need to run 'git push -u origin ${branch}' for ${repoRoot}`,
      { baseCommit, localCommit, remoteCommit, remoteUrl, repoInfo }
    )
  }
  let isUpToDate = false
  if (localCommit === remoteCommit) {
    // Up-to-date
    isUpToDate = true
  } else if (localCommit === baseCommit) {
    errors.push('Out of sync: Need to pull')
  } else if (remoteCommit === baseCommit) {
    errors.push('Out of sync: Need to push')
  } else {
    errors.push('Out of sync: Diverged')
  }

  try {
    // make sure there are no uncommitted changes to the repository that aren't
    // specifically ignored using the .gitignore file
    const { stdout: status } = await execa(
      'git',
      [
        '-C',
        repoRoot,
        'status',
        '-s'
      ]
    )
    if (status !== '') {
      errors.push('Out of sync: local changes exist that are not yet committed')
      isUpToDate = false
    }
  } catch (e) {
    return failWithError(
      `Could not determine if local changes match remote due to error: ${e}`,
      { baseCommit, localCommit, remoteCommit, remoteUrl, repoInfo }
    )
  }

  return {
    baseCommit,
    errors,
    isUpToDate,
    localCommit,
    remoteCommit,
    remoteUrl,
    repoInfo
  }
}

module.exports = gitRepoIsUpToDate
