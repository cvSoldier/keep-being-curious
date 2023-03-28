---
title: this
date: 2021-09-22
---
### this的指向规则 ###
**new > 显式绑定 > 隐式绑定 > 默认绑定**  

- 默认绑定：  
在独立函数调用时，不管是否在调用栈中，this都指向全局对象。  
严格模式下，不能将全局对象window用于默认绑定。  
+ 显式绑定：  
使用`call`和`apply`，将this绑定到参数对象上。  
* 隐式绑定：  
当函数引用有上下文对象时，隐式绑定规则会把函数调用中的this，绑定到这个上下文对象。  
对象属性引用链中只有最后一层在调用位置中起作用。    
- new绑定：任何函数都可能被用作构造函数，当函数被 new 操作符"构造调用"时，会执行下面操作：  
1. 创建一个新对象（若该函数不是JS内置的，则创建一个新的Object对象）   
2. 将this绑定到这个对象   
3. 执行构造函数中的代码（为这个新对象添加属性）   
4. 若函数没有返回其他对象，则自动返回这个新对象；若函数有return返回的是非对象，则还是自动返回这个新对象，即覆盖那个非对象。

补充：箭头函数的this是定义时候的this，并且箭头函数没有arguments对象，不能使用new调用。

```javascript
// 隐式丢失
function foo() {
  console.log( this.a );
}

var obj = {
  a: 2,
  foo: foo
};

var bar = obj.foo; // 这里bar将引用foo函数本身，所以不带有函数对象的上下文

var a = "oops, global"; // a是全局对象的属性

bar(); // "oops, global"
```

```javascript
function fnArrow() {
  setTimeout(() => {
    console.log(this)
  });
}
fnArrow.call({ name: 'obj' }) // 1

function fnNormal() {
  setTimeout(function() {
    console.log(this)
  })
}
fnNormal.call({ name: 'obj' }) // 2
// 1输出 obj，2输出window  
// 1执行时，在setTimeout中回调定义为箭头函数，所以箭头函数内部的this是定义时的this  
// 2执行时，在setTimeout中回调定义为普通函数，回调执行时，this规则是默认绑定，所以是window
```
