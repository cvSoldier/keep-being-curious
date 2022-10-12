> 升级原因：webpack5 的 cache 太太太香了
### 1、npm run build 执行两遍打包
vue-cli5 默认会为现代浏览器额外打一个 `<script type="module">` 里面使用的包，在cli定义build命令的代码里可以看到：
```javascript
api.registerCommand('build', {
   description: 'build for production',
    usage: 'vue-cli-service build [options] [entry|pattern]',
    options: {
      // ...
      '--no-module': `build app without generating <script type="module"> chunks for modern browsers`,
      // ...
    }
  }, () => {})
```
所以package中build命令改为 `vue-cli-service build --mode production --no-module` 即可。

### 2、hard-source-webpack-plugin
直接删掉就可以了，webpack5 的强大缓存，可以保证开发环境的二次构建速度直接起飞🛫️。

### 3、prerender-spa-plugin
这个错误是webpack5的 [filesystem](https://github.com/webpack/webpack/pull/9251) 重构导致的：“mkdirp is no longer expected to be a function on the output file system”。  
同时 prerender-spa-plugin 代码是依赖 mkdirp 这个api的：
```javascript
// es6/index.js
const compilerFS = compiler.outputFileSystem

const mkdirp = function (dir, opts) {
  return new Promise((resolve, reject) => {
    compilerFS.mkdirp(dir, opts, (err, made) => err === null ? resolve(made) : reject(err))
  })
}
```
所以就报错了，compilerFS 这个对象上已经没有 mkdirp 了，联系上下文这个函数的作用是递归创建目录，因为一般情况下，webpack的 `compiler.outputFileSystem` 就是 node 的fs，所以可以替换为 `compilerFS.mkdir()`。 
```javascript
compilerFS.mkdir === fs.mkdir // true
``` 
需要注意的是 fs.mkdir 默认不能递归创建目录，需要携带 `{ recursive: true }` 选项，来实现类似 `mkdir('/不存在的目录1/不存在的目录2', opts, () => {})` 的调用。  
又因为 prerender-spa-plugin 这个库已经没人维护了，所以只能用patch-package去修改node_modules，修改后的代码：
```javascript
const mkdirp = function (dir, opts = { recursive: true }) {
  return new Promise((resolve, reject) => {
    compilerFS.mkdir(dir, opts, (err, made) => err === null ? resolve(made) : reject(err))
  })
}
```

### 4、prerender-spa-plugin
cli5关闭了preload插件，[有issue要打开，](https://github.com/vuejs/vue-cli/issues/7206)但是不知道为啥没开。（小声bb：虽然vue-cli的README标明了项目处于维护模式，但是到目前（10月12号）为止最近的一次提交还是9月4号，我寻思这也妹维护啊）