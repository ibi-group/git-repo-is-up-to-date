/**
 * Utility method to return failure status with error message.
 * @param  {error | string} e error object or error message string
 * @return {gitRepoIsUpToDateReturnObject}   [description]
 */
function failWithError (e) {
  const error = !e
    ? 'Failed with unknown error.'
    : e.message
      ? e.message
      : e
  return {
    baseCommit: null,
    errors: [error],
    isUpToDate: false,
    localCommit: null,
    remoteCommit: null,
    remoteUrl: null,
    repoInfo: null
  }
}

module.exports = {
  failWithError
}
