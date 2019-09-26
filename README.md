# how_to_optimize
一些前端优化方式和他们的正反例代码对比  
Some front-end optimization methods and their positive and negative example code comparison


- css解析顺序为从右向左  
- 不要使用行内样式  
- 减少回流重绘
  - 缓存layout属性  
  - 批量修改DOM  
  - 将包含动画的元素放在absolute中

- 任务切片
  - 异步切片（以绘制多个echarts为例）

- 节流防抖  
- 懒加载
- Vue优化(fork自https://github.com/Akryum/vue-9-perf-secrets)
  - 函数式组件  
  - 拆分子组件  
  - 减少作用域链查找  
  - 使用v-show复用DOM  
  - keep-alive  
  - 延迟加载DOM  
  - 时间切片  
  - 不响应式数据  
## 持续更新中。。。
