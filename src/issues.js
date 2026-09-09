#! /usr/bin/env node
import chalk from 'chalk'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import got from 'got'
import simpleGit from 'simple-git'
import { printGitError } from './_git.js'

const findPackage = start => {
  let dir = start
  while (true) {
    const file = join(dir, 'package.json')
    if (existsSync(file)) {
      return file
    }
    const parent = dirname(dir)
    if (parent === dir) {
      return null
    }
    dir = parent
  }
}

const githubSlug = value => {
  if (!value) {
    return null
  }
  const normalized = String(value)
    .trim()
    .replace(/^git\+/, '')
    .replace(/[?#].*$/, '')
    .replace(/\/$/, '')
    .replace(/\.git$/, '')
  const shorthand = normalized.match(/^(?:github:)?([^/:\s]+)\/([^/\s]+)$/i)
  if (shorthand) {
    return `${shorthand[1]}/${shorthand[2]}`
  }
  const match = normalized.match(/github\.com(?::|\/)([^/\s]+)\/([^/\s]+)$/i)
  return match ? `${match[1]}/${match[2]}` : null
}

const packageRepository = start => {
  const file = findPackage(start)
  if (!file) {
    return null
  }
  try {
    const pkg = JSON.parse(readFileSync(file, 'utf8'))
    const repository = typeof pkg.repository === 'string'
      ? pkg.repository
      : pkg.repository?.url
    return githubSlug(repository)
  } catch {
    return null
  }
}

const gitRepository = async start => {
  try {
    const git = simpleGit(start)
    if (!(await git.checkIsRepo())) {
      return null
    }
    const remotes = await git.getRemotes(true)
    const remote = remotes.find(item => item.name === 'origin') || remotes[0]
    return githubSlug(remote?.refs.fetch || remote?.refs.push)
  } catch {
    return null
  }
}

const cwd = process.argv[2] || process.cwd()

try {
  const repo = packageRepository(cwd) || await gitRepository(cwd)
  if (!repo) {
    throw new Error("couldn't determine the GitHub repository")
  }

  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'git-slop'
  }
  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const repoPath = repo.split('/').map(encodeURIComponent).join('/')
  const data = await got(`https://api.github.com/repos/${repoPath}/issues`, {
    headers,
    searchParams: { per_page: 30, state: 'open' }
  }).json()
  if (!Array.isArray(data)) {
    throw new Error('GitHub returned an unexpected response')
  }

  const issues = data.filter(item => !item.pull_request).slice(0, 5)
  if (issues.length === 0) {
    console.log(chalk.blue('\n   -    no open issues!   -\n'))
  } else {
    issues.forEach(issue => {
      let title = issue.title || ''
      if (title.length > 70) {
        title = title.substring(0, 68) + '..'
      }
      console.log(
        `    ${chalk.blue('#' + issue.number)}   -  ${chalk.green(title)}`
      )
    })
  }
} catch (err) {
  if (err.response?.statusCode) {
    printGitError(new Error(`GitHub request failed (${err.response.statusCode})`))
  } else {
    printGitError(err)
  }
}
