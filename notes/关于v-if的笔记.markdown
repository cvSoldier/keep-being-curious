*一个因为v-if使用不正确的 bug，感觉挺有意思的*  
### 问题 ###  

需求是聊天应用的语音转文字，思路是有缓存用缓存，没有缓存调接口并更新缓存。代码结构大概如下
```html
<!-- MsgItem.vue -->
<trans-text v-if="showText" @close="showText = false"/>

<!-- TransText.vue -->
{{ text || '' }}
{{ isTransferred ? '转换成功' : '正在转换' }}
```
```javascript
// TransText.vue
const cache = {}

export default {
  created() {
    this.dealCache()
  }
  methods: {
    dealCache() {
      if(cache[id]) {
        if(!cache[id].pending) { // 命中缓存且pending === false 说明有值直接用
          // ...
        }
      } else {
        cache[id] = { pending: true }
        fetch().then(() => {
          // ...
          cache[id].pending = false 
        })
      }
    }
  }
}
```
问题是，转文字的返回值来源可能是接口（查库），库里没有，后端会调用其他服务，然后在 `websocket`(简称ws) 返回给我。有一个场景是接口以为`websocket`会推给我，但是 ws
没推，所以前端需要一个请求超时设置，超时之后就关闭转文字的loading状态。  
这也很简单
>说明一下，超时应该是同意在 request 的封装里做的，但是考虑到 ws 的原因，组件需要额外的超时
```javascript
// TransText.vue
methods: {
  dealCache() {
    if(cache[id]) {
      // ...
    } else {
      cache[id] = { pending: true }
      cache[id].timeoutID = setTimeout(() => {
        // 界面提示超时消息等
        this.$emit('close')
      }， 6000)
      fetch().then(() => {
        // ...
        cache[id].timeoutID && clearTimeout(cache[id].timeoutID)
        cache[id].pending = false 
        this.$emit('close')
      })
    }
  }
}
```
然后 bug 就来了，场景是，用户右键消息，选择`转文字`，然后`<trans-text />`显示
```
。。。
正在转换
```
然后点`收起文字`，再点击`转文字`。
因为 cache 的缘故，避免了重复点击转文字，重复发送请求的情况。但是假如第一次的`ws`没有推给我，代码走到setTimeout里，想法是提示消息，并关闭`<trans-text />`组件。然而事实 `this.$emit('close')` 触发的事件没有传到父组件中。  

### 产生原因 ###

简单的vue父子组件通信为什么没有生效。
```
<trans-text @close="showText = false"/>

this.$emit('close')
```

原因是在用户在第一次点击 `转文字` 通过 v-if 生成组件时，假设我们生成了 TransText组件1
这个组件定义了setTimeout之后，就被用户点击 `收起文字` 销毁了  
然后用户再次点击 `转文字`， 生成了TransText组件2  
然后超时，代码执行到setTimeout的回调  
但是回调函数中的this，指向的是定义回调函数时的this，也就是TransText组件1，这时父组件中的TransText组件已经是2代了，所以不能正常通信。

### 解决方法 ###
知道原因之后解决就很简单了，我们要做的是让setTimeout回调中的 `this` 指向当前的TransText组件，因为`cache`的 key 是唯一的消息id，所以我们可以把当前组件对应的this一起存在cache[id]中
```javascript
// TransText.vue
methods: {
  dealCache() {
    if(cache[id]) {
      if(!cache[id].pending) { // 命中缓存且pending === false 说明有值直接用
        // ...
      } else { 
        // pending === true说明之前打开过组件并销毁重开了
        // 把当前 this 挂到cache[id]下 
        cache[id].componentEle = this  
      }
    } else {
      cache[id] = { pending: true }
      cache[id].timeoutID = setTimeout(() => {
        // 界面提示超时消息等
        // 如果多次打开关闭，使用最新的组件实例进行子父通信
        const ctx = cache[id].componentEle || this
        ctx.$emit('close')
      }， 6000)
      fetch().then(() => {
        // ...
      })
    }
  }
}
```

### 一些思考 ###
分析出问题之后，第一反应是使用 v-show 不销毁组件实例进行切换，但是我把转文字调接口等等操作和生命周期挂钩，就导致使用v-show的话 首次获取聊天记录时，每一条语音消息都会发送转文字的请求。  
BUT，错的不是v-show，而是把业务代码和生命周期耦合。现在这种方法确实有效，但是或许本来就应该通过在父组件中调用子组件方法来更简洁清晰的控制流程。
```html
<!-- MsgItem.vue -->
<trans-text refs="transText" v-show="showText" @close="showText = false"/>

// ...
this.$refs.transText.dealCache()
```

BBUT，使用生命周期的好处是可以通过created和mounted两个钩子方便的判断组件渲染前后的滚动高度，来实现如果当前已经滚动到底部，那么渲染组件之后滚动条也应该继续滚在最底部。
