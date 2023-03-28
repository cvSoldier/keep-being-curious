---
title: 解决循环引用和相同引用的js深拷贝实现
date: 2020-02-04
---

JSON.parse(JSON.stringfy())、MessageChannel这些JavaScript自身的api，想要实现深拷贝存在像不能复制undefined、不能复制函数、不能复制循环引用等问题。
#### v1
要实现对象深拷贝，第一反应的关键词有：判断类型，递归。代码如下
```
function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

function cloneDeep(target) {
  
  if(!isObject(target)) return target

  let result = Array.isArray(target) ? [] : {}
  
  const keys = Object.keys(target);
  for(let i = 0, len = keys.length; i < len; i++) {
    result[keys[i]] = cloneDeep(target[keys[i]])
  }
  return result
}
```
#### v2
上面的代码仅能实现基础功能，至于标题中所说的循环引用和相同引用问题并没有处理。
先来解释一下，循环引用是指
```
var circle = {}
circle.circle = circle
//或者
var a = {}, b = {}
a.b = b
b.a = a
```
相同引用是指
```
var arr = [1,2,3]
var obj = {}
obj.arr1 = arr
obj.arr2 = arr
```
对于循环引用的对象使用v1版本的深拷贝很明显会直接栈溢出。
而对于包含相同对象引用的问题在于，因为复制之前`obj.arr1`和`obj.arr2`是指向相同对象的，修改其中一个另一个也会改动。使用v1版本的代码拷贝之后，新对象这两个属性的指向将不再相同。
就像这样：
```
obj.arr1 === obj.arr2 // true
var cloneObj = cloneDeep(obj)
cloneObj.arr1 === cloneObj.arr2 // false
```
解决方法的思路来自[这儿(我是传送门)](https://juejin.im/post/5b20c9f65188257d7d719c1c)。
1、通过闭包维护一个变量，变量中储存已经遍历过的对象
2、每次递归时判断当前的参数是否已经存在于变量中，如果已经存在，就说明已经递归过该变量，就可以停止这次递归并返回上次递归该变量时的返回值
代码如下
```
function cloneDeep(obj){ 
  let visitedObjs = [];
  function baseClone(target){

    if(!isObject(target)) return target

    for(let i = 0; i < visitedObjs.length; i++){
      if(visitedObjs[i].target === target){        
        return visitedObjs[i].result;
      }
    }

    let result = Array.isArray(target) ? [] : {} 
    
    visitedObjs.push({ target, result }) 

    const keys = Object.keys(target);
    for(let i = 0, len = keys.length; i < len; i++) {
      result[keys[i]] = baseClone(target[keys[i]])
    }
    return result
  } 
  return baseClone(obj);
}
```
#### v2.1
这部分是我理解v2代码时的一些误区，也可以当作是深入理解的过程，可跳过。
学习v2代码的时候，有点没搞懂`visitedObjs.push({ target, result })`这里push result的含义，因为`result`是之前调用栈中复制的结果，`target`就是他要复制的对象，那在
```
for(let i = 0; i < visitedObjs.length; i++){
  if(visitedObjs[i].target === target){        
    return visitedObjs[i].result;
  }
}
```
中干嘛还要返回`visitedObjs[i].result`，直接返回`target`就完事儿了。
以
```
var arr = [1]
var obj = { 1:arr, 2:arr }
var cloneObj = cloneDeep(obj)
```
为例，调用栈大概如下图所示  
![image.png](https://segmentfault.com/img/bVbC7oF)  
其中，**第2次**是复制`obj`中第一个`arr`,**第4次**是复制第二个，**第四次**会因为`visitedObjs`中存在对象的`target`属性与当前参数`target`相等，而返回`[1]`。
按照前面所说的想法修改代码，运行结果返回值是`{1: [1], 2: [2]}`。看起来是正确的，但是在原对象中存在`obj[1] === obj[2]`,在复制之后的对象中这个等式并不成立。
原因是**第4次**中返回的值`visitedObjs[1].result`是**第2次**复制的结果，这样使得两个对象地址相同，相等。如果返回`target`，实际上则是返回了指向原对象中`arr`数组的引用。也就是说存在`obj[1] === cloneObj[2]`，明显是不正确的。

#### v2.2
问题已经解决了，有之前做的LeetCode第一题的经验，可以用map来代替数组进行查找。
```
function cloneDeep(obj) {
  let vistedMap = new Map();
  function baseClone(target) {
    
    if(!isObject(target)) return target

    if(vistedMap.get(target)) return vistedMap.get(target)

    let result = Array.isArray(target) ? [] : {}

    vistedMap.set(target, result)
    
    const keys = Object.keys(target);
    for(let i = 0, len = keys.length; i < len; i++) {
      result[keys[i]] = baseClone(target[keys[i]])
    }
    return result
  }
  return baseClone(obj)
}
```
#### v3
再写一个广度优先遍历(BFS)的版本。
```
function cloneDeepBFS(data){
  if(!isObject(data)) return data
  var visitedMap = new Map() // 备注1
  var queue = [] // 备注2
  queue.push(data)
  while(queue.length){
    var curData = queue.shift()
    // curData是原始对象，obj是复制对象
    if(visitedMap.get(curData)) {
      var obj = visitedMap.get(curData) // 备注3
    } else {
      var obj = Array.isArray(curData) ? [] : {}
      visitedMap.set(curData, obj)
    }
    
    var keys = Object.keys(curData)
    for(var i = 0, len = keys.length; i < len; i++) {
      var temp = curData[keys[i]]
      if(!isObject(temp)) {
        obj[keys[i]] = temp
      }
      if(visitedMap.get(temp)) {
        obj[keys[i]] = visitedMap.get(temp)
      } else {
        obj[keys[i]] = Array.isArray(curData) ? [] : {}
        visitedMap.set(temp, obj[keys[i]])
        queue.push(temp)
      }
    }
  }
  return visitedMap.get(data)
}
```
备注：
1、依然使用的`map`来解决循环引用和相同引用。
2、实现BFS的核心队列。
3、实现值的传递，还是以`var arr = [1]; var obj = { 1:arr, 2:arr }; var cloneObj = cloneDeep(obj)`为例

![image.png](https://segmentfault.com/img/bVbDdHE)

红箭头就是这行代码的作用，使本次while的obj指向之前while里obj的子。

测试代码
```
var arr = [1]
var circle = { name: 'circle' }
circle.circle = circle
var obj = {1: arr, 2: { 3: circle, 4: arr }}
var a = cloneBFS(obj)

a[1] === a[2][4] // true
a[2][3] === a[2][3]['circle'] // true
```

完。