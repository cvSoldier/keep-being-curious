---
title: peerDependencies
date: 2022-11-02
---
### dependencies与peerDependencies区别  
假设我们当前的项目是MyProject，假设其中有一个依赖包PackageA，该包的package.json文件指定了对PackageB的依赖：  
```json
{
  "dependencies": {
    "PackageB": "1.0.0"
  }
}
```
`npm install PackageA`, 项目的目录结构会是如下形式：  
MyProject  
&nbsp;&nbsp;|- node_modules  
&nbsp;&nbsp;&nbsp;&nbsp;|- PackageA  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|- node_modules  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|- PackageB  

那么在我们的项目中，我们能通过下面语句引入"PackageA"：
```
var packageA = require('PackageA')
```
但是，如果你想在项目中直接引用PackageB:
```
var packageA = require('PackageA')
var packageB = require('PackageB')
```
这是不行的，即使PackageB被安装过；因为Node只会在 MyProject/node_modules 目录下查找PackageB，它不会在进入PackageA模块下的node_modules下查找。  

为了解决这种问题，引入 peerDependencies

例如上面PackageA的package.json文件如果是下面这样：
```json
{
  "peerDependencies": {
    "PackageB": "1.0.0"
  }
}
```
它会告诉npm：如果某个package把我列为依赖的话，那么package也必需应该有对PackageB的依赖。

这时候 `npm install PackageA` ，目录结构就是：

MyProject  
&nbsp;&nbsp;|- node_modules  
&nbsp;&nbsp;&nbsp;&nbsp;|- PackageA  
&nbsp;&nbsp;&nbsp;&nbsp;|- PackageB