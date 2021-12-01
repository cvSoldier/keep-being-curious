### 骨架屏是什么
骨架屏是一个页面的空白版本，通过这个空白版本传递信息，我们的页面正在**渐进式**的加载过程中。我理解loading就是简单版的骨架屏，他们都想表现一个加载过程。
### 实现方式：
1.vue-server-renderer
vue-server-renderer将整个项目在node端打包成一份bundle，我们使用他的打包能力，设置额外的webpack入口配置，写一个只包含骨架屏的new Vue()，打包之后把html代码注入工程的index.html，实现骨架屏。
2.page-skeleton-webpack-plugin
饿了么的骨架屏插件，通过 puppeteer 在服务端操控 headless Chrome 打开开发中的需要生成骨架屏的页面，在等待页面加载渲染完成之后，在保留页面布局样式的前提下，通过对页面中元素进行删减或增添，对已有元素通过层叠样式进行覆盖，这样达到在不改变页面布局下，隐藏图片和文字，通过样式覆盖，使得其展示为灰色块。然后将修改后的 HTML 和 CSS 样式提取出来，这样就是骨架屏了。

### prerender是什么
和第二种骨架屏方案相同，通过一些渲染机制，比如 puppeteer 或则 jsdom 将页面在构建的过程中就渲染好，然后插入到 html 中，这样在页面启动之前首先看到的就是预渲染的页面了。

### 选型
使用vue-server-renderer的问题：
1. 需要开发一个额外的skeleton.vue，并配置一套完整的打包流程。
2. 当前工程的入口页面不唯一（登录页面和保存了登陆状态的业务页面刷新操作），肯定是不希望他们显示同一个骨架屏。

使用prerender的问题：
1. 需要修改线上的linux环境使其支持puppeteer

考虑到如果入口页面改动可能会引起的skeleton.vue改动，选择puppeteer，考虑到入口页面不唯一，选择prerender。

### 使用的简单demo
```javascript
// main.js
new Vue({
  mounted() {
    document.dispatchEvent(new Event('render-active'))
  },
  render: (h) => h(App),
}).$mount('#app')
```
```javascript
// webpack.config.js
plugins: [
  new PrerenderSPAPlugin({
    staticDir: path.join(__dirname, './dist'),
    outputDir: path.join(__dirname, './dist/static'),
    indexPath: path.join(__dirname, './dist', 'index.html'),
    routes: ['/vue/login'],
    renderer: new Renderer({
      headless: true, // false是开启浏览器预览
      renderAfterDocumentEvent: 'render-active'
      // renderAfterElementExists: '.container',
      // renderAfterTime: 5000,
    })
  })
]
```
### 遇到的问题
1.如果 renderAfterDocumentEvent: 'render-active' 不触发，会一直执行打包操作，建议先把headless=false开启浏览器预览进行调试，  
2.puppeteer会开启一个本地服务加载`new PrerenderSPAPlugin()`中配置的indexPath读取index.html，比如打包之后目录：  

|-dist  
&nbsp;&nbsp;|-js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-1.js  
&nbsp;&nbsp;|-index.html  

同时如果线上环境配置了publicPath，那么index.html文件中的资源引用就是
```html
<script src="publicPath/js/1.js">
```
这样的引用方式，会导致本地服务加载不到资源而无法正常渲染。需要配置服务的proxy：  
```javascript
new PrerenderSPAPlugin({
  // ...
  server: {
    port: 8000,
    proxy: {
      '/public/js': {
        target: 'http://localhost:8000',
        // PrerenderSPAPlugin使用的server配置是webpack-dev-server
        // https://github.com/webpack/docs/wiki/webpack-dev-server#rewriting-urls-of-proxy-request
        pathRewrite: {
          '^/public/js': '/js',
        },
      }
    },
  },
})
```
