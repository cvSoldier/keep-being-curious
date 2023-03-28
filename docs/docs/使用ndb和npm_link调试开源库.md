---
title: 使用ndb和npm_link调试开源库
date: 2022-09-30
---

以webpack为例  
### 1. 安装ndb
```
npm i ndb -g
```
### 2. link
需要把 webpack源码 和 demo项目中安装的webpack依赖连接起来。  
首先在download下来的webpack源码跟路径执行
`npm link`, 再执行 `pwd` 并记录当前目录。  
进入demo项目执行 `npm link ${上一步获取的源码目录}`  
demo/node_modules目录下出现如下图标表示link成功。
![图图](/assets/%E4%BD%BF%E7%94%A8ndb%E5%92%8Cnpm_link%E8%B0%83%E8%AF%95%E5%BC%80%E6%BA%90%E5%BA%93.jpg)

### 3. 调试
在想要进行调试脚本执行前加入 ndb 命令即可，如`ndb npm run build`
