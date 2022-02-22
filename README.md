<div align="center">
  <a href="https://npmjs.org/package/git-slop">
    <img src="https://img.shields.io/npm/v/git-slop.svg?style=flat-square" />
  </a>
  <div>make fewer mistakes with cleaner git commands</div>
</div>

reformatting of some common git commands:

`slop-status`

![image](https://user-images.githubusercontent.com/399657/48082771-6c7eff00-e1c1-11e8-8314-30b8d3ee6fe7.png)

`slop-log`

![image](https://user-images.githubusercontent.com/399657/40754315-b9a437a8-6446-11e8-8880-d42b05915cd3.png)

`slop-issues`
![image](https://user-images.githubusercontent.com/399657/44490437-5a62db00-a62c-11e8-8494-49890180848b.png)

`slop-people`
![image](https://user-images.githubusercontent.com/399657/155150945-bfef5793-a7f1-4040-83fa-296b5ae241cb.png)

best way to use is to install this package globally, then alias to it:

`npm i -g git-slop`

then in ~/.bash_profile, add whatever aliases you'd like:
```sh
alias gs="slop-status"
alias glog="slop-log"
```
WIP

made with [nodegit](http://npmjs.com/package/nodegit), [chalk](http://npmjs.com/package/chalk), and [spacetime](http://npmjs.com/package/nodegit)

MIT
