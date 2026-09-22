import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const script = new URL('../src/issues.js', import.meta.url).href

const runIssues = (t, mockFetch, token = '') => {
  const cwd = mkdtempSync(join(tmpdir(), 'git-slop-issues-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))
  writeFileSync(join(cwd, 'package.json'), JSON.stringify({ repository: 'github:owner/repo' }))
  return spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict'
    globalThis.fetch = ${mockFetch}
    await import(${JSON.stringify(script)})
  `], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '0', GITHUB_TOKEN: token }
  })
}

test('issues sends GitHub parameters and authentication and filters pull requests', t => {
  const result = runIssues(t, `async (url, { headers }) => {
    assert.equal(url.href, 'https://api.github.com/repos/owner/repo/issues?per_page=30&state=open')
    assert.equal(headers.accept, 'application/vnd.github+json')
    assert.equal(headers['user-agent'], 'git-slop')
    assert.equal(headers.authorization, 'Bearer test-token')
    return {
      ok: true,
      json: async () => [
        { number: 1, title: 'Pull request', pull_request: {} },
        ...Array.from({ length: 6 }, (_, i) => ({ number: i + 2, title: 'Issue ' + i }))
      ]
    }
  }`, 'test-token')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stderr, '')
  assert.equal(result.stdout, Array.from({ length: 5 }, (_, i) => `    #${i + 2}   -  Issue ${i}\n`).join(''))
})

test('issues supports unauthenticated requests and empty results', t => {
  const result = runIssues(t, `async (url, { headers }) => {
    assert.equal(headers.authorization, undefined)
    return { ok: true, json: async () => [] }
  }`)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, '\n   -    no open issues!   -\n\n')
})

test('issues reports HTTP errors before parsing the response body', t => {
  const result = runIssues(t, 'async () => ({ ok: false, status: 403 })')
  assert.equal(result.status, 1)
  assert.equal(result.stdout, '')
  assert.equal(result.stderr, 'Error: GitHub request failed (403)\n')
})

test('issues rejects unexpected JSON responses', t => {
  const result = runIssues(t, 'async () => ({ ok: true, json: async () => ({}) })')
  assert.equal(result.status, 1)
  assert.equal(result.stderr, 'Error: GitHub returned an unexpected response\n')
})

test('issues reports network failures', t => {
  const result = runIssues(t, "async () => { throw new TypeError('fetch failed') }")
  assert.equal(result.status, 1)
  assert.equal(result.stderr, 'Error: fetch failed\n')
})
