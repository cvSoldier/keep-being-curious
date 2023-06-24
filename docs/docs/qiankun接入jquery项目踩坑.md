---
title: qiankun接入jquery项目踩坑
date: 2023-06-24
---
老项目使用的是angularJS + requireJs + jq，碰到的主要问题就是各种变量undefined。  
问题产生的原因在于，这种项目的第三方依赖全靠全局变量，在`<script src="main.js">`之上会引用很多依赖，比如
```html
<script src="A.js">
<script src="B.js">
```
其中B依赖于A，所以要把A放到上面，先加载，这样B.js代码执行时，环境中就会存在 `var A = 'xxx'` 的全局变量供 B 调用了。  
但是在 `qiankun` 环境下，会创造沙盒隔离主子应用，方式是把子应用的静态代码放到一个函数中执行
```javascript
function(proxy, window) {
  // 原本代码
}
``` 
这样的话，原本的全局变量就会变成各个函数内的局部变量，导致借助window的依赖关系断裂。  
解决办法就是找到报 undefined 的变量定义的位置，手动把全局变量添加到子应用的proxy上，变成子应用的全局变量。
```javascript
window.A = A
```
在构建工具的环境下，会根据依赖关系把关联的内容构建到一个文件中，所以没有这种问题。