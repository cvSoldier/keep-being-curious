### 贴心小tips ###  
1、 service worker不是像 js 一样代替文件更新，而是直接修改原本文件。
> 浏览器会尝试在后台重新下载定义 Service Worker 的脚本文件。 如果 Service Worker 文件与其当前所用文件存在字节差异，则将其视为新 Service Worker ([来源](https://developers.google.com/web/fundamentals/primers/service-workers#update-a-service-worker)）

2、生成 ssl  
像我一样觉得`openssl`麻烦的同学，可以尝试一下`mkcert`  
- windows 下安装需要先安装 `choco`  
管理员打开 powershell 执行   
`Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))`  
运行 `choco` 检查是否安装正确。  
- 执行 `choco install mkcert` 安装 mkcert
- 执行 `mkcert -install`  
再执行 `mkcert example.com "*.example.com" example.test localhost 127.0.0.1 ::1`
- 噔噔噔噔，生成成功
