二次封装组件库遇到一个问题:
像button这种组件,进行属性和事件的透传就可以了
```html
<a-button v-bind="$attrs" v-on="$listeners">
  <slot></slot>
</a-button>
```
但是tabs这种组件，其实是父+子两个组件，再像上面那种方式封装，组件的嵌套会变成
```html
<tabs-wrap>
  <tabs>
    <tab-pane-wrap>
      <tab-pane></tab-pane>
    </tab-pane-wrap>
  </tabs>
</tabs-wrap>
```
又因为大多数组件库，都会对这种有关联关系的组件做校验，比如element的tabs组件内部只能包含tab-pane
```javascript
// 实现方式
calcPaneInstances(isForceUpdate = false) {
  // 过滤 slot 中 name 是 ElTabPane 的子组件
  const paneSlots = this.$slots.default.filter(vnode => vnode.tag &&
    vnode.componentOptions && vnode.componentOptions.Ctor.options.name === 'ElTabPane');
  const panes = paneSlots.map(({ componentInstance }) => componentInstance);
},
```
就导致不能像上面那样做二次封装，只能把tabs和tab-pane写在一起，同时因为vue的<component>的is属性支持两种1.已注册组件的名字，2一个组件的选项对象，所以可以把各个组件的选项对象放在panes中当作props传进组件：
```html
<!-- test-tabs.vue -->
<template>
  <a-tabs v-bind="$attrs" v-on="listenerAll">
    <a-tab-pane v-for="pane in panes" :tab="pane.name">
      <component :is="pane.componentInstance" />
    </a-tab-pane>
  </a-tabs>
</template>
```
使用的时候：
```html
<!-- 业务.vue -->
<template>
  <test-tabs :panes="panes"/>
</template>
```
```js
import component1 from './component1'
import component2 from './component2'
{
  data() {
    return {
      panes: [
        { name: '组件1', componentInstance: component1 }
        { name: '组件2', componentInstance: component2 }
      ]
    }
  }
}
```
又有问题：首先是使用上会有落差，直接props写组件选项对象的方式，和以前注册组件写插槽的方式不同，而且还有一个重量级问题是没办法在 业务.vue 中通过$refs选择pane中渲染的组件，比如有个操作需要在 组件1 打开组件2选项卡并且调用他实例的某个方法，如果是正常使用第三方组件库，<component> 是当作插槽写在 业务.vue 中的。但是按照上面封装的组件，插槽位置只能在<tab-pane></tab-pane>中间，这样的话相当于每个选项卡下面都渲染了所有组件。
```html
<!-- 正常使用第三方组件库 -->
<a-tabs v-bind="$attrs" v-on="listenerAll">
  <!-- 我们循环的是tab-pane，相当于tabs下面有很多pane，每个pane对应一个component -->
  <a-tab-pane v-for="pane in panes" :tab="pane.name">
    <component :is="pane.componentInstance" />
  </a-tab-pane>
</a-tabs>

<!-- 按照我们的封装方式添加插槽 -->
<test-tabs>
  <component v-for="pane in panes" :is="pane.componentInstance" />
</test-tabs>

<!-- 组件内部的嵌套 -->
<a-tabs v-bind="$attrs" v-on="listenerAll">
  <a-tab-pane v-for="pane in panes" :tab="pane.name">
    <!-- <slot /> -->
    <component v-for="pane in panes" :is="pane.componentInstance" />
  </a-tab-pane>
</a-tabs>
```
借鉴上述element处理$slots的方式，使用`render()`代替`<template>`[vue2相关内容](https://cn.vuejs.org/v2/guide/render-function.html#%E6%8F%92%E6%A7%BD)