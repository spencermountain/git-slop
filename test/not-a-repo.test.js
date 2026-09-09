import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const scripts = [
  ['status'],
  ['log'],
  ['people'],
  ['commit', 'message'],
  ['push']
]

test('Git commands exit cleanly outside a repository', async t => {
  const cwd = mkdtempSync(join(tmpdir(), 'git-slop-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))

  for (const [script, ...args] of scripts) {
    await t.test(script, () => {
      const result = spawnSync(
        process.execPath,
        [resolve(`src/${script}.js`), ...args],
        {
          cwd,
          encoding: 'utf8',
          env: { ...process.env, FORCE_COLOR: '0' }
        }
      )

      assert.equal(result.status, 1)
      assert.equal(result.stdout, '')
      assert.equal(result.stderr, 'Error: not in a Git repository.\n')
    })
  }
})
