---
title: bind使用场景
date: 2022-08-04
---

单个页面包含两个相同组件，他们都需要向父组件通信
```html
<parent>
  <child @done="handleDone">
  <child @done="handleDone">
</parent>
```
done的钩子函数包含参数a，不能常规传参来区分，会覆盖默认函数
```html
<child @done="handleDone(1)">
```

使用bind来添加参数
```html
<child @done="handleDone.bind(this, 1)">
```

### 20230611更新
或者可以使用vue封装的$event:
```html
<child @done="$event => handleDone($event, 1)">
```
有些工程不能bind，还没有找到原因