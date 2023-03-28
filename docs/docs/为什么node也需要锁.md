---
title: 为什么node也需要锁
date: 2022-07-11
---

Nodejs is single threaded, and the code execution never gets interrupted inside an event loop, so locking is unnecessary? This is true ONLY IF your critical section can be executed inside a single event loop. However, if you have any async code inside your critical section (it can be simply triggered by any I/O operation, or timer), your critical logic will across multiple event loops, therefore it's not concurrency safe!

Consider the following code
```js
redis.get('key', function(err, value) {
	redis.set('key', value * 2);
});
```
The above code simply multiply a redis key by 2. However, if two users run concurrently, the execution order may like this

```
user1: redis.get('key') -> 1
user2: redis.get('key') -> 1
user1: redis.set('key', 1 x 2) -> 2
user2: redis.set('key', 1 x 2) -> 2
```
Obviously it's not what you expected  

[来源](https://www.npmjs.com/package/async-lock)