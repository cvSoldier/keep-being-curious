![一张大图](./assets/webpack%E6%B5%81%E7%A8%8B%E6%A2%B3%E7%90%86.png)

### Q&A
Q: Webpack 编译过程会将源码解析为 AST 吗？  
A: 构建阶段会读取源码，解析为 AST 集合  

Q: webpack 与 babel 分别实现了什么?  
A: Webpack 读出 AST 之后仅收集模块依赖关系，然后去递归处理子模块；  
babel 是把高版本语法编译成低版本语法，确保新的es特性也能在浏览器中运行。  
webpack 通过 babel-loader 使用 babel 

Q: 构建阶段是哪个hook？