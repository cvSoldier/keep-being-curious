### 配CI/CD

1.查看linux系统版本  
```
cat /proc/version
```
2.根据不同版本安装
```
# Linux x86-64
sudo wget -O /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64

 # Linux x86
sudo wget -O /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-386

 # Linux arm
sudo wget -O /usr/local/bin/gitlab-runner https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-arm
```
3.给gitlab-runner执行权限
```
chmod +x /usr/local/bin/gitlab-runner
```
LINUX下不同的文件类型有不同的颜色,  
蓝色表示目录;  
绿色表示可执行文件，可执行的程序;  
红色表示压缩文件或包文件;  
浅蓝色表示链接文件;  
灰色表示其它文件;  
红色闪烁表示链接的文件有问题了  
黄色表示设备文件.   
因此如果只是普通的上传startPM2.sh这个文件，那么上传之后也就是一个普通的文件，不能执行
你不 chmod +x 颜色就是普通文本的颜色，+x 之后颜色就是绿色的了。chmod -x 就是普通文本颜色，普通文本颜色是不能执行的，执行会报错；chmod +x 就是绿色的可执行文件了。  

4.创建一个gitlab-runner用户，之后使用CI/CD时，都是在这个用户下进行的
```
useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
```
5.安装,启动  
```
gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
```
```
gitlab-runner start
```

## clone_url
配置runner的机器不能直接访问到gitlab，可以设置clone_url来配置`git clone`时的url。[how-clone_url-works](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#how-clone_url-works)

## 踩坑  
### git fetch-pack
```
Reinitialized existing Git repository in /home/gitlab-runner/builds/dLoFQVz-/0/qkt/pepper-vue/.git/
fatal: git fetch-pack: expected shallow list
fatal: The remote end hung up unexpectedly
ERROR: Job failed: exit status 1
```
如果runner的机器git版本时1.x，升级到2解决问题。

### gitlab-runner用户
安装 gitlab-runner 构建机默认会将用户设置为 gitlab-runner，该设置会导致.gitlab-ci.yml 脚本运行时出现一些权限问题。为了解决这些权限问题，将 gitlab-runner 的默认用户设置为 root。   
执行  
```
ps aux | grep gitlab-runner
```
结果：  
![](./assets/gitlab%20CICD/github-runner.jpg)
顺序执行下面命令
```
gitlab-runner uninstall
gitlab-runner install --user root
gitlab-runner restart
```
再次执行 `ps aux | grep gitlab-runner`，user改为了root ：  
![](./assets/gitlab%20CICD/root.jpg)

### cache 和 artifacts
cache：存储项目的dependencies，比如node_modules，不需要每次跑pipeline都重新安装。

artifacts：用来在stage之间传递stage生成物，在不同的pipline之间不可用。

开始为了能让node_modules和dist能在各个stage共享，都写在了根节点：
```
cache:
  paths:
    - node_modules
    - dist
```
导致比如deploy的阶段，即使没有使用到node_modules,也会浪费时间去检查、更新缓存:
![](./assets/gitlab%20CICD/deploy%20cache.jpg)
阶段共耗时1m 8s，但是实际执行部署脚本只有2s，检查和更新缓存消耗14s + 50s = 1m 4s。  

其实可以为每个不同的job定制不同的缓存策略：  
比如install阶段：
```
cache:
  paths:
    - node_modules/
  policy: pull-push # 获取和更新缓存
```
build阶段：
```
cache:
  paths:
    - node_modules
  policy: pull # 只需要获取缓存用来build
artifacts: # dist不需要写在cache里，只需要在build阶段传递到deploy
  name: 'bundle'
  paths: 
    - dist
```
deploy就不用写cache了。  
修改之后 deploy 阶段仅耗时几秒：  
![](./assets/gitlab%20CICD/deploy%20without%20cache.jpg)

整体结果快了一倍左右：  
![](./assets/gitlab%20CICD/result.jpg)