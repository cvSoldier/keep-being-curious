---
title: require.context
date: 2021-12-12
---

### require.context是什么 ### 

一个webpack的api，通过执行require.context函数获取一个特定的上下文，主要用来实现 **自动化** 导入模块  
如果遇到从一个文件夹引入很多模块的情况，可以这个api，可以遍历文件夹中的指定文件，然后自动导入，使得不需要每次显式的调用import导入模块。  
### require.context怎么用 ### 
require.context函数接受3个参数
```javascript
/*
 * @param directory {String} -读取文件的路径
 * @param useSubdirectories {Boolean} -是否遍历文件的子目录
 * @param regExp {RegExp} -匹配文件的正则
 */
```
示例：  
```javascript
require.context('./test', false, /\.test\.js$/);
//一个 context，其中文件来自 test 目录，request 以 `.test.js` 结尾。
require.context('../', true, /\.stories\.js$/);
// 一个 context，其中所有文件都来自父文件夹及其所有子级文件夹，request 以 `.stories.js` 结尾。
```
require.context函数执行后返回的是一个 `require` 函数, 并且这个函数有3个属性:  
resolve 是一个函数，它返回 request 被解析后得到的模块 id。  
keys 也是一个函数，它返回一个数组，由所有可能被此 context module 处理的请求组成。  
有点乱，举个例子，目录结构：  
project  
&nbsp;&nbsp;|- modules  
&nbsp;&nbsp;&nbsp;&nbsp;|- index.js  
&nbsp;&nbsp;&nbsp;&nbsp;|- moduleA.js  
&nbsp;&nbsp;&nbsp;&nbsp;|- moduleB.js  

```javascript
const context = require.context('.', false, /\.js$/)

console.log(context.keys()) // ['./index.js', './moduleA.js', './moduleB.js'] 返回一个数组
let arr = []

context.keys().forEach(item => {
  if (item === './index.js') return
  arr.push(context(key).default) // 读取出文件中的default模块
})

```
### 拿来干啥 ### 
注册svg，全局组件啥的