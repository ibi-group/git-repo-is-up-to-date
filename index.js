const execa = require('execa')
const origin = require('git-remote-origin-url')
const gitRepoInfo = require('git-repo-info')

/**
 * The return object of the gitRepoIsUpToDate function.
 *
 * @typedef {Object} gitRepoIsUpToDateReturnObject
 * @property {string} baseCommit The commit hash of the merge base commit
 * @property {Array<string>} errors A list of all
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
export default async function gitRepoIsUpToDate (folder = process.cwd()) {
  let remoteUrl
  try {
    remoteUrl = await origin(folder)
  } catch (e) {
    return {
      baseCommit: null,
      errors: [e.message],
      isUpToDate: false,
      localCommit: null,
      remoteCommit: null,
      remoteUrl: null,
      repoInfo: null
    }
  }

  const repoInfo = gitRepoInfo(folder)
  const repoRoot = repoInfo.root
  const errors = []

  // run some git commands to make sure repo is up to date
  // modified from https://stackoverflow.com/a/3278427/269834
  const { stdout: localCommit } = await execa('git', ['-C', repoRoot, 'rev-parse', '@'])
  const { stdout: remoteCommit } = await execa('git', ['-C', repoRoot, 'rev-parse', '@{u}'])
  const { stdout: baseCommit } = await execa('git', ['-C', repoRoot, 'merge-base', '@', '@{u}'])
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

  // make sure there are no changes to the configurations
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
