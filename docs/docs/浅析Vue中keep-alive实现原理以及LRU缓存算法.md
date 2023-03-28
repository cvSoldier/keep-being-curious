---
title: 浅析Vue中keep-alive实现原理以及LRU缓存算法
date: 2019-09-27
---

> *本文涉及源码版本为 2.6.9*
### keep-alive ###

```
// src/core/components/keep-alive.js

export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes, // 缓存白名单
    exclude: patternTypes, // 黑名单
    max: [String, Number] // 缓存组件的最大数量
  },

  created () {
    this.cache = Object.create(null) // 缓存
    this.keys = [] // 缓存的VNode的键
  },

  destroyed () {
    for (const key in this.cache) {
      // 删除所有缓存
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    // 监听黑白名单变动
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render () {
    //...
  }
}
```
组件的定义很平常,不过其中`abstract`属性在官方文档中并未提及,后面的渲染过程中会用到。

`created`中初始化存储缓存的`cache`对象，和缓存的VNode的键的数组。

`mounted`中监听黑白名单变动对缓存进行更新，其中`pruneCache`定义如下
```
function pruneCache (keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cachedNode: ?VNode = cache[key]
    if (cachedNode) {
      const name: ?string = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}

function pruneCacheEntry (
  cache: VNodeCache,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const cached = cache[key]
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}
```
就比如`include`是`['a', 'b']`,而且这两个组件也都经过`keep-alive`缓存了，然后`include`变成`['a']`，就把缓存中的`b`组件剔除。

`destroyed`中遍历在`created`声明的`cache`，使用和`mounted`类似的方式清空缓存。

```
render () {
  const slot = this.$slots.default
  const vnode: VNode = getFirstComponentChild(slot) // 获取其中第一个(也应该是唯一一个)子组件对象
  const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
  if (componentOptions) {
    // check pattern
    const name: ?string = getComponentName(componentOptions)
    const { include, exclude } = this
    if ( // 判断是否是需要缓存组件
      // not included
      (include && (!name || !matches(include, name))) ||
      // excluded
      (exclude && name && matches(exclude, name))
    ) {
      return vnode
    }

    const { cache, keys } = this
    const key: ?string = vnode.key == null
      // same constructor may get registered as different local components
      // so cid alone is not enough (#3269)
      ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
      : vnode.key
    if (cache[key]) { // 命中缓存
      vnode.componentInstance = cache[key].componentInstance
      // make current key freshest
      remove(keys, key)
      keys.push(key)
    } else { // 没有命中缓存
      cache[key] = vnode
      keys.push(key)
      // prune oldest entry
      if (this.max && keys.length > parseInt(this.max)) {
        pruneCacheEntry(cache, keys[0], keys, this._vnode)
      }
    }

    vnode.data.keepAlive = true
  }
  return vnode || (slot && slot[0])
}
```
1、获取`keep-alive`第一个子组件  
2、根据`include exclude`名单进行匹配，决定是否缓存。如果不匹配，直接返回组件实例，如果匹配，到第3步  
3、根据组件id和tag生成缓存组件的`key`，再去判断`cache`中是否存在这个key，即是否命中缓存，如果命中，用缓存中的实例替代vnode实例，然后更新`key`在`keys`中的位置，(LRU置换策略)。如果没有命中，就缓存下来，如果超出缓存最大数量`max`,删除`cache`中的第一项。  
4、最后组件实例的keepAlive属性设置为true，这个在渲染和执行被包裹组件的钩子函数会用到，这里不详细说明。

关于开始提到的`abstract`属性，注意到官方文档中有这样一段关于`keep-alive`的描述，
\<keep-alive\> 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在父组件链中。

Vue在初始化生命周期的时候，为组件实例建立父子关系时会根据abstract属性决定是否忽略某个组件。在keep-alive中，设置了abstract:true，那Vue就会跳过该组件实例。
```
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }
  // ...
}
```

### LRU ###
LRU（Least recently used）算法根据数据的历史访问记录来进行淘汰数据，其核心思想是“如果数据最近被访问过，那么将来被访问的几率也更高”。

最常见的实现是使用一个链表保存缓存数据，详细算法实现如下：
1. 新数据插入到链表头部；

2. 每当缓存命中（即缓存数据被访问），则将数据移到链表头部；

3. 当链表满的时候，将链表尾部的数据丢弃。

当存在热点数据时，LRU的效率很好，但偶发性的、周期性的批量操作会导致LRU命中率急剧下降，缓存污染情况比较严重。复杂度比较简单，代价则是命中时需要遍历链表，找到命中的数据块索引，然后需要将数据移到头部。

### 参考 ###
https://ustbhuangyi.github.io/vue-analysis/extend/keep-alive.html#%E7%BB%84%E4%BB%B6%E6%B8%B2%E6%9F%93
https://www.iteye.com/blog/flychao88-1977653