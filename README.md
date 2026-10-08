<div align="center">
  <div><b>git-slop</b></div>
  <div>Pretty-printed git outputs</div>
  <div><code>npm install git-slop</code></div>
  <div align="center">
    <sub>
      by
      <a href="https://github.com/spencermountain">Spencer Kelly</a>
    </sub>
  </div>
  <img height="25px" src="https://user-images.githubusercontent.com/399657/68221824-09809d80-ffb8-11e9-9ef0-6ed3574b0ce8.png"/>
</div>
<!--2nd row-->
<div align="center">
  <div>
    <a href="https://npmjs.org/package/git-slop">
    <img src="https://img.shields.io/npm/v/git-slop.svg?style=flat-square" />
  </a>
  </div>
</div>

## Install
```sh
npm install --global git-slop
```

alternatively:
```js
git clone https://github.com/spencermountain/git-slop.git
cd ./git-slop
pnpm link --global
```

## Commands

- `slop-status [path]` shows staged and unstaged changes in two columns.
- `slop-log [path]` shows the 25 most recent commits grouped by day and author.
- `slop-people [path]` counts commits by author.
- `slop-issues [path]` shows up to five open GitHub issues.
- `slop-commit <message>` commits staged changes with the supplied message.
- `slop-push` pushes the current branch.
- `slop-diff` pretty-printed summary of git-diff 
- `slop-diff-file` pretty-printed diff of one file 

`slop-issues` reads the nearest package.json repository field and falls back to
the Git remote. Set `GITHUB_TOKEN` when querying private repositories or when
you need a higher GitHub API rate limit.

The commands work well as short shell aliases:

```sh
alias gs="slop-status"
alias glog="slop-log"
```

## Examples

### Status

![slop-status output](https://user-images.githubusercontent.com/399657/48082771-6c7eff00-e1c1-11e8-8314-30b8d3ee6fe7.png)

### Log

![slop-log output](https://user-images.githubusercontent.com/399657/40754315-b9a437a8-6446-11e8-8880-d42b05915cd3.png)

### Diff

![slop-diff output](https://github.com/user-attachments/assets/1fc60989-11d7-4f33-b934-af62dd42d6e9)

### Diff-file
![slop-diff-file output](https://github.com/user-attachments/assets/3225cba2-c20c-4fa4-a2ca-b1d74f0025d0)

### Issues

![slop-issues output](https://user-images.githubusercontent.com/399657/44490437-5a62db00-a62c-11e8-8494-49890180848b.png)

### People

![slop-people output](https://user-images.githubusercontent.com/399657/155150945-bfef5793-a7f1-4040-83fa-296b5ae241cb.png)

--- 
Built with [simple-git](https://www.npmjs.com/package/simple-git) and
[Spacetime](https://www.npmjs.com/package/spacetime).

MIT - PRs welcome
