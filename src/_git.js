import { styleText } from 'node:util'
import simpleGit from 'simple-git'

export const printGitError = err => {
  const raw = err && err.message ? err.message : String(err)
  const message = raw.split('\n')[0].replace(/^fatal:\s*/i, '')
  console.error(styleText('red', `Error: ${message}`, { stream: process.stderr }))
  process.exitCode = 1
}

export const runInGitRepo = async (callback, baseDir = process.cwd()) => {
  try {
    const repo = simpleGit(baseDir)
    if (!(await repo.checkIsRepo())) {
      throw new Error('not in a Git repository.')
    }
    await callback(repo)
  } catch (err) {
    printGitError(err)
  }
}

export const hasHead = async repo => {
  try {
    await repo.revparse(['--verify', 'HEAD'])
    return true
  } catch {
    return false
  }
}
