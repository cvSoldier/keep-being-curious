### 贴心小tips ###  
1、 service worker不是像 js 一样代替文件更新，而是直接修改原本文件。
> 浏览器会尝试在后台重新下载定义 Service Worker 的脚本文件。 如果 Service Worker 文件与其当前所用文件存在字节差异，则将其视为新 Service Worker ([来源](https://developers.google.com/web/fundamentals/primers/service-workers#update-a-service-worker)）
