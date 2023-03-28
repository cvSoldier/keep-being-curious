---
title: 从源码切入Vue双向绑定原理，并实现一个demo
date: 2019-09-01
---

>*本文涉及源码版本为 2.6.9*

### 准备工作 ###
down一份Vue源码，从package.json入手，找我们需要的代码
1、package.json中的scripts，`"build": "node scripts/build.js"`
2、scripts/build.js line26 `build(builds)`，其中builds的定义为11行的`let builds = require('./config').getAllBuilds()`,这个大概就是打包的代码内容，另一个build是在下面定义的函数，他的代码是这样的：
```
function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}
```
这段代码有说法，其中的`buildEntry`是使用rollup进行打包的函数，定义一个next函数，把多个吃内存的打包操作串行，达到减小瞬间内存消耗的效果，这算是常用的一个优化方式了。
3、顺着scripts/config.js里的getAllBuilds()的逻辑摸到line28的`const aliases = require('./alias')`,然后打开scripts/alias.js,看到里面的`vue: resolve('src/platforms/web/entry-runtime-with-compiler')`终于有点豁然开朗，然后再根据一层层的import找到src/core/instance/index.js里的`function Vue(){}`，准备工作到此结束。
### new Vue()发生了什么 ###
就一行，`this._init(options)`,这是在函数initMixin()中定义在Vue.prototype上的方法
```
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```
需要留意的分别是`initState(vm)`和`vm.$mount(vm.$option.el)`

 1. initState(vm)

 ```
export function initState (vm: Component) {
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  }
}
```
  字面意思，初始化props，methods，data，由于目的是看数据双向绑定，就直接进initData()
  

  1.1 proxy

   在initData()中，遍历data中的keys判断是否与props和methods重名，然后对他们设置了一层代理
 ```
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```
  这就是为什么我们可以直接通过this.name获取到this.data.name的值。
  关于Object.defineProperty()可以设置的属性描述符，其中
 - configurable控制是否可以配置，以及是否可以delete删除， 配置就是指是否可以通过Object.defineProperty修改这个属性的描述，没错如果你通过defineProperty把某个属性的configurable改为false，再想改回来是不可能的。![clipboard.png](https://segmentfault.com/img/bVbw7FF?w=401&h=270)
 - enumerable控制是否可枚举，赋值为false之后，`Object.keys()`就看不见他了。
 - 还有value、writable、get、set，都比较好理解就不再赘述。

  1.2、new Observe()

  遍历完keys，就是以data作为参数调用`observe`了,而observe内部得主要内容就是`ob = new Observer(value)`,再看Observer这个类。（有一种抽丝剥茧得感觉）
 ```
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```
  函数`def`的作用就是在对象上定义属性。然后判断传进的data是对象还是数组。

  1.2.1、Array.isArray(value)

  如果value是数组的话，先通过`hasProto`这个自定义函数来判断当前环境中是否存在`__proto__`，如果有的话就可以直接用，没有的话，手动
  实现一下，功能是一样的，那就只看`protoAugment(value, arrayMethods)`干了啥就好
 ```
function protoAugment (target, src: Object) {
  target.__proto__ = src
}
```
  其中target自然就是我们observe的数组，而src也就是arrayMethods的定义如下
 ```
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```
  看着代码里的`methodsToPatch`里的几项，眼熟吗  
  ![clipboard.png](https://segmentfault.com/img/bVbw70c?w=747&h=423)  
  再看到倒数第四行的`ob.dep.notify()`,配上官方注释*notify change*。  
  也就是说`arrayMethods`是一个继承数组原型的对象，并对其中特定的几种方法做了处理，然后在`new Observe(value)`的时候，如果value是数组，就让value继承这个`arrayMethods`，然后这个数组调用特定的方法时，会调用当前Observe类上的dep属性的`notify`方法，进行后续操作。
  定义完这些，再进行递归对数组中的每一项继续调用`observe`

  1.2.2、walk & defineReactive

  然后对于对象而言，直接调用`walk`，然后遍历对象中的非继承属性，对每一项调用`defineReactive`
 ```
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}
```
  `defineReactive`的主要代码就是各种判断递归和`Object.defineProperty()`了，这也是双向绑定的关键一部分，从数据到DOM。
  其中对get的定义包含了`if(Dep.target){ dep.depend() }`,对set的定义包含了`dep.notify()`,接下来看Dep的方法。

  1.3 Dep

  Dep的定义是这样的
 ```
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```
  来看在get中调用的`dep.depend()`,`Dep.target`不为空的情况下，以this为参数，调用`Dep.target.addDep`,target是Dep类的静态属性，类型为Watcher，方法addDep定义如下
 ```
addDep (dep: Dep) {
const id = dep.id
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    if (!this.depIds.has(id)) {
      dep.addSub(this)
    }
  }
}
```
  可以看到addDep有去重dep的作用，然后通过调用`dep.addSub(this)`,把当前的Dep.target push到subs中。
  也就是说，data里面有个observer,然后observer里面有个dep，dep里面有个watcher数组，收集依赖一条龙。

  至于在set中调用的`dep.notify()`,是遍历watcher数组，调用每一项的update方法，而update方法，核心代码是调用watcher的run方法，run方法的核心是`this.cb.call(this.vm, value, oldValue)`。问题又来了，这个cb是new Watcher时的传参，但是从`initState`一步一步看下来，先new一个Observe，然后定义其中每个属性的`get`和`set`，`get`时收集依赖，`set`时通知变更。但是并没有看到哪里真的触发了我们所设置的`get`，而且之前说到的`Dep.target`是个啥呢。

 2. vm.$mount(vm.$option.el)

  前文有提到new Vue时也调用了这个方法，$mount是前面找Vue入口文件的过程中，在其中一个里定义在Vue原型上的方法
 ```
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```
  然后再找`mountComponent`,果然在这个函数的调用中，找到了
 ```
mountComponent() {
  // 其他逻辑
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
}
```
  再去看Watcher的构造函数，有调用自己的`get`方法，定义如下
 ```
get () {
  pushTarget(this)
  let value
  const vm = this.vm
  try {
    value = this.getter.call(vm, vm)
  } catch (e) {
    if (this.user) {
      handleError(e, vm, `getter for watcher "${this.expression}"`)
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value)
    }
    popTarget()
    this.cleanupDeps()
  }
  return value
}
```
  先`pushTarget(this)`来设置`Dep`的静态属性`target`,然后调用`this.getter.call(vm, vm)`来做虚拟DOM相关的操作，并且触发对data对象上的属性设置的`getter`,最后`popTarget()`把`Dep.target`置为null。
  `Dep.target`的作用就是只有在初始化时才会收集依赖，要不然每次取个值收集依赖再判重，卡都卡死了。
### 最后 ###
跟着源码梳理了一遍逻辑，对Vue的了解也更深入了一些，再去看Vue官网中对响应式原理的描述，也更清晰了。

![clipboard.png](https://segmentfault.com/img/bVbw89m?w=757&h=734)

本文也只是大概讲了一下右边红框中的实现逻辑，关于左边的虚拟DOM，暂时真的没看懂。基于上面逻辑自己尝试着写了一个简版的Vue[->传送门][1]，尤大不是说一开始Vue也只是个自己写着玩的项目，多尝试总是没有错。
文中没有说清楚的地方欢迎指正，如果你也对Vue实现原理感兴趣，不妨也去down一份源码亲自探索吧


  [1]: https://github.com/cvSoldier/VueSelf