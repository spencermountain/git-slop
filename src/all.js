#!/usr/bin/env node
import { styleText } from 'node:util'
import { runInGitRepo } from './_git.js'

const msg = process.argv.slice(2).join(' ').trim()

await runInGitRepo(async repo => {
  await repo.add(['--all'])
  if (msg) {
    const status = await repo.status()
    if (!status.isClean()) {
      const result = await repo.commit(msg)
      const noun = result.summary.changes === 1 ? ' change' : ' changes'
      console.log(styleText('green', '          +' + result.summary.changes + noun))
    }
  }
  console.log(styleText('green', '  ✓'))
})
