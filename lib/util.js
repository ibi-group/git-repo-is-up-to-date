/**
 * Utility method to return failure status with error message.
 * @param  {error | string} e error object or error message string
 * @param {Object} partial An object with any partial data collected so far
 * @return {gitRepoIsUpToDateReturnObject}   [description]
 */
function failWithError (
  e,
  {
    baseCommit = null,
    localCommit = null,
    remoteCommit = null,
    remoteUrl = null,
    repoInfo = null
  }
) {
  const error = !e
    ? 'Failed with unknown error.'
    : e.message
      ? e.message
      : e
  return {
    baseCommit,
    errors: [error],
    isUpToDate: false,
    localCommit,
    remoteCommit,
    remoteUrl,
    repoInfo
  }
}

module.exports = {
  failWithError
}
