就是实现一个类似`Promise.all`的函数，但是要求其中的`promise`最多只能同时pending固定数量个。  
思路是先同步发送 limit 个promise，他们resolve之后就再发送一个来顶上这个位置。
```javascript
/**
 * @param {Array<Promise>} 
 * @param {Number} limit 控制并发数量
 */
function requestLimit (arr, limit) {
  const { length } = arr
  const result = []
  let index = 0 // 控制进度，表示当前位置
  let sum = 0 // 记录请求完成总数

  return new Promise((resolve, reject) => {
    // 先连续调用，就代表最大并发数量
    while (index < limit) {
      next()
    }
    function next(){
      const cur = index++
      if (cur >= length) return

      const promise = arr[cur]
      promise(url).then(res => {
        result[cur] = cur
        if (++sum >= length) {
          resolve(result)
        } else {
          next()
        }
      }).catch(reject)
    }
  })
}
```
开始有讲是类似Promise.all的，因为实际自己控制了每个promise的rejected情况，所以既可以让他像Promise.all，也可以像Promise.allSettled，以前做微信小程序有个上传图片，但是小程序的api只支持单张上传，就应该是`allSettled`的逻辑。  
但是all的好处是比如多个请求有依赖的关系，比如promise1失败了就中断后续promise，比如最近一个场景是需要间隔固定时间共轮询固定次数发送同样的请求，然后同时监听接口和websocket的返回值，一旦返回中断后续。

再补充一个个人认为更好的实现思路，
```javascript
class RequestLimit {
  constructor (limit) { 
    this.limit = Number(limit) || 2
    this.blockQueue = [] 
    this.currentReqNumber = 0
  } 

  async request(req) {
    if (!req) { throw new Error('req is required.') } 
    if (Object.prototype.toString.call(req) !== '[object Function]') { 
      throw new Error('Req must be a function.') 
    } 
    if (this.currentReqNumber >= this.limit) {
      // 阻塞队列增加一个 Pending 状态的 Promise
      // 灵魂代码
      await new Promise(resolve => this.blockQueue.push(resolve)) 
    } 
    return this._handlerReq(req)
  } 

  async _handlerReq(req) { 
    this.currentReqNumber++
    try { 
      return await req() 
    } catch (err) { 
      return Promise.reject(err) 
    } finally { 
      this.currentReqNumber--
      if (this.blockQueue.length) { // 每完成一个就从阻塞队列里剔除一个 
        this.blockQueue[0]() // 将最先进入阻塞队列的 Promise 从 Pending 变为 Fulfilled 
        this.blockQueue.shift() 
      } 
    }
  }
}
```
这个题，或者说是场景，以前面试还是工作都遇到过，第一种写法都是我最先想到的写法，一个萝卜一个坑，我先给你都填满，哪个坑空了我填哪个坑。首先代码没有明显体现阻塞的概念，第二种实现方式里
```javascript
await new Promise(resolve => this.blockQueue.push(resolve)) 
```
这行代码实在太爽了看着。  
其次是我自己写代码的一个问题，刷leetcode时候通过之后去看评论区高赞的代码，发现自己总是习惯把单个场景复杂成多个场景，比如在这个上下文中，我就把阻塞队列复杂为先同步发送n个请求，再定义递归函数next，实现控制并发请求数量。  
这行代码实在太爽了，again.