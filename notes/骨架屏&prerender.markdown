### 骨架屏是什么
骨架屏是一个页面的空白版本，通过这个空白版本传递信息，我们的页面正在**渐进式**的加载过程中。我理解loading就是简单版的骨架屏，他们都想表现一个加载过程。
### 实现方式：
1.vue-server-renderer
vue-server-renderer将整个项目在node端打包成一份bundle，我们使用他的打包能力，设置额外的webpack入口配置，写一个只包含骨架屏的new Vue()，打包之后把html代码注入工程的index.html，实现骨架屏。  
2.page-skeleton-webpack-plugin
饿了么的骨架屏插件，通过 puppeteer 在服务端操控 headless Chrome 打开开发中的需要生成骨架屏的页面，在等待页面加载渲染完成之后，在保留页面布局样式的前提下，通过对页面中元素进行删减或增添，对已有元素通过层叠样式进行覆盖，这样达到在不改变页面布局下，隐藏图片和文字，通过样式覆盖，使得其展示为灰色块。然后将修改后的 HTML 和 CSS 样式提取出来，这样就是骨架屏了。

### prerender是什么
和第二种骨架屏方案相同，通过一些渲染机制，比如 puppeteer 或则 jsdom 将页面在构建的过程中就渲染好，然后插入到 html 中，这样在页面启动之前首先看到的就是预渲染的页面了。

### prerender和骨架屏的区别
浏览器从上至下开始渲染，碰到dom，渲染出来，然后碰到 `<script src="./dist/app.js"/>`，执行new Vue()，虚拟dom挂载到dom。预渲染和骨架屏都是在new Vue()之前，在dom上动手脚。骨架屏打包之后只有一个index.html，没有路由的概念，这就导致所有路由的刷新操作，都渲染的是一套骨架屏，
预渲染则是多了路由，打包之后除了基础的index.html，还会根据路由生成对应的文件目录，比如要预渲染的路由是`a/b`，那么打包之后dist下面会增加`dist/a/b/index.html`文件，这样访问`a/b`时其实访问的不是根目录的html而是预渲染的。
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
3.centos7不能打包的错误
因为系统缺少chromium的依赖，执行
```
yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 ipa-gothic-fonts xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-utils xorg-x11-fonts-cyrillic xorg-x11-fonts-Type1 xorg-x11-fonts-misc -y
```
附带一些踩坑时候学的linux命令  
ldd：查看应用缺少的依赖  
grep：正则  
比如`ldd chrome | grep not`会输出chrome所有依赖中not found的部分  
sudo：指使用超级管理员权限运行  
yum install -y： yum自动确认列出的需要安装的依赖，不加-y的话会有一个输入y/n的步骤