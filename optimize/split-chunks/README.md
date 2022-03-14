# split-chunks
vue-cli3默认webpack
```javascript
cacheGroups: {
  common: {
    name: 'chunk-common',
    minChunks: 2,
    priority: -20,
    chunks: 'initial',
    reuseExistingChunk: true
  }
}
```
![analyzer](./READMEAssets/analyzer.png)

## performance
home路由  
![home](./READMEAssets/home.png)  
about路由  
![about](./READMEAssets/about.png)
