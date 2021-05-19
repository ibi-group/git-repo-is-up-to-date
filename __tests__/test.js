const path = require('path')

const execa = require('execa')
const fs = require('fs-promise')
const tmp = require('tmp-promise')

const gitRepoIsUpToDate = require('../lib/index')

/**
 * Clone this repo into a temp dir and return the path that the repo was cloned
 * into
 */
async function cloneRepo () {
  // create a temp dir for this test without any git repo
  const tmpDir = await tmp.dir()

  // clone this repo into that dir
  await execa(
    'git',
    ['clone', 'https://github.com/ibi-group/git-repo-is-up-to-date.git'],
    { cwd: tmpDir.path }
  )

  return path.join(tmpDir.path, 'git-repo-is-up-to-date')
}

describe('git-repo-is-up-to-date', () => {
  it('should return false on a directory that is not within a git repository', async () => {
    // create a temp dir for this test without any git repo
    const tmpDir = await tmp.dir()

    const result = await gitRepoIsUpToDate(tmpDir.path)
    expect(result.isUpToDate).toEqual(false)
  })

  it('should return false on a newly created repository with no remote record', async () => {
    // create a temp dir for this test without any git repo
    const tmpDir = await tmp.dir()

    // clone this repo into that dir
    await execa('git', ['init'], { cwd: tmpDir.path })

    const result = await gitRepoIsUpToDate(tmpDir.path)
    expect(result.isUpToDate).toEqual(false)
  })

  it('should return true on an up-to-date repo', async () => {
    const result = await gitRepoIsUpToDate(await cloneRepo())
    expect(result.isUpToDate).toEqual(true)
  })

  it('should return false on an unpushed branch', async () => {
    const clonedRepoPath = await cloneRepo()

    await execa(
      'git',
      ['checkout', '-b', 'test'],
      { cwd: clonedRepoPath }
    )

    const result = await gitRepoIsUpToDate(clonedRepoPath)
    expect(result.isUpToDate).toEqual(false)
  })

  it('should return false when a checked-in file has been edited', async () => {
    const clonedRepoPath = await cloneRepo()

    // edit a file
    await fs.writeFile(path.join(clonedRepoPath, 'README.md'), 'blah')

    const result = await gitRepoIsUpToDate(clonedRepoPath)
    expect(result.isUpToDate).toEqual(false)
  })

  it('should return false when a new file has been created', async () => {
    const clonedRepoPath = await cloneRepo()

    // create a new file
    await fs.writeFile(path.join(clonedRepoPath, 'tmp.js'), 'blah')

    const result = await gitRepoIsUpToDate(clonedRepoPath)
    expect(result.isUpToDate).toEqual(false)
  })

  it('should return false when a new file has been created and committed', async () => {
    const clonedRepoPath = await cloneRepo()

    // create a new file
    const newFilePath = path.join(clonedRepoPath, 'tmp.js')
    await fs.writeFile(newFilePath, 'blah')

    // debug git status
    let statusOut = await execa('git', ['status'], { cwd: clonedRepoPath })
    console.log(statusOut)

    // add file
    statusOut = await execa('git', ['add', newFilePath], { cwd: clonedRepoPath })
    console.log(statusOut)

    // debug git status
    statusOut = await execa('git', ['status'], { cwd: clonedRepoPath })
    console.log(statusOut)

    // set git config for this repo so that making a commit is possible
    statusOut = await execa(
      'git',
      [
        'config',
        'user.email',
        'test@ibi-group.com'
      ],
      { cwd: clonedRepoPath }
    )
    console.log(statusOut)
    statusOut = await execa(
      'git',
      [
        'config',
        'user.name',
        'test'
      ],
      { cwd: clonedRepoPath }
    )
    console.log(statusOut)

    // make a commit (don't push)
    try {
      statusOut = await execa('git', ['commit', '-m', 'add new file'], { cwd: clonedRepoPath })
      console.log(statusOut)
    } catch (e) {
      console.error(e)
      throw e
    }

    const result = await gitRepoIsUpToDate(clonedRepoPath)
    expect(result.isUpToDate).toEqual(false)
  })
})
