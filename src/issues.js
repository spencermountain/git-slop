#! /usr/bin/env node
import { styleText } from 'node:util'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
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
  const url = new URL(`https://api.github.com/repos/${repoPath}/issues`)
  url.searchParams.set('per_page', '30')
  url.searchParams.set('state', 'open')
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status})`)
  }
  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('GitHub returned an unexpected response')
  }

  const issues = data.filter(item => !item.pull_request).slice(0, 5)
  if (issues.length === 0) {
    console.log(styleText('blue', '\n   -    no open issues!   -\n'))
  } else {
    issues.forEach(issue => {
      let title = issue.title || ''
      if (title.length > 70) {
        title = title.substring(0, 68) + '..'
      }
      console.log(
        `    ${styleText('blue', '#' + issue.number)}   -  ${styleText('green', title)}`
      )
    })
  }
} catch (err) {
  printGitError(err)
}
