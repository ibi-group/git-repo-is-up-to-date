const gitRepoIsUpToDate = require('./index')

describe('git-repo-is-up-to-date', () => {
  it('should return false on a directory that is not within a git repository', async () => {
    const result = await gitRepoIsUpToDate('/tmp')
    expect(result.isUpToDate).toEqual(false)
  })

  it('should return true on an up-to-date repo', async () => {
    const result = await gitRepoIsUpToDate()
    expect(result.isUpToDate).toEqual(true)
  })
})
