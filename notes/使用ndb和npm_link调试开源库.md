以webpack为例  
### 1. 安装ndb
```
npm i ndb -g
```
### 2. link
需要把 webpack源码 和 demo项目中安装的webpack依赖连接起来。  
首先在download下来的webpack源码跟路径执行
`npm link`, 再执行 `pwd` 并记录当前目录。  
进入demo项目执行 `npm link ${上一步获取的源码目录}`  
demo/node_modules目录下出现如下图标表示link成功。
