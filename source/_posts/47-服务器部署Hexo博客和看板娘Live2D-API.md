---
title: 服务器部署 Hexo 博客和看板娘 Live2D API
categories: [科技树]
tags: [服务器, Hexo, 持续集成]
pid: 47
date: 2020-04-15 19:45:00
---

在服务器上部署 Hexo 静态博客有两种方案，一是直接把源代码推送到服务器上，然后在服务器上安装 Node.js 和 hexo-cli，从而直接在服务器上构建网页文件并部署；二是依旧按照之前部署到对象存储的方案，用 GitHub 作为源代码托管，然后用 GitHub Actions 构建网页文件，再同步到服务器的网站根目录下。<!--more-->这里，我选择后一种方案，这样修改的地方比较少，也比较方便。

## 1. 通过 GitHub Actions 部署 Hexo

首先，修改原来的 GitHub Actions 脚本，删去部署到阿里云 OSS 的内容，添加如下内容：

```yaml
- name: Deploy to server
  uses: easingthemes/ssh-deploy@v2.1.2
  env:
    ARGS: "-avz --delete"
    SOURCE: "public/" # 要同步到服务器的目录
    SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }} # 配置在服务器上公钥所对应的私钥
    REMOTE_HOST: ${{ secrets.REMOTE_HOST }} # 服务器 IP 地址
    REMOTE_PORT: ${{ secrets.REMOTE_PORT }} # SSH 连接端口
    REMOTE_USER: ${{ secrets.REMOTE_USER }} # 服务器 SSH 连接用户名，如 root
    TARGET: ${{ secrets.REMOTE_TARGET }} # 服务器上对应网站的根目录
```

对于上述变量，我们直接添加在代码仓库设置的 Secrets 中即可。对于阿里云轻量应用服务器，可以在控制台很容易地生成密钥对，并下载由于连接服务器的私钥（生成后重启一下服务器）。

设置好 GitHub Actions 各项参数之后，需要在宝塔面板上创建网站，并设置域名等内容，这里就不详细介绍。如果需要 Let's Encrypt SSL 通配符证书，可能还需要进行 DNS 解析认证，这就需要我们去域名解析提供商那边获取一个可以编辑 DNS 解析记录的 token，方便宝塔面板自动配置解析记录。

最后，因为 GitHub Actions 同步到服务器网站目录过程中用到了 rsync 这一数据镜像备份工具，所以需要先在服务器上安装好 rsync：

```sh
apt-get install rsync
```

**备注**：如果服务器提供商的控制台没有自动配置密钥对的功能，可以在服务器上手动生成。

```sh
# 进入用户 SSH 密钥存储目录
cd ~/.ssh
# 列出目录中内容，确认是否已拥有密钥
ls
# 生成 SSH 密钥
ssh-keygen
```

首先 `ssh-keygen` 会确认密钥的存储位置（默认是 `.ssh/id_rsa`），然后它会要求你输入两次密钥口令。 如果你不想在使用密钥时输入口令，将其留空即可。

```sh
# 将公钥内容写入 authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
# 列出私钥的内容
cat ~/.ssh/id_rsa
```

最后，我们把私钥的内容复制到 GitHub 代码仓库设置的 Secrets 中 `SSH_PRIVATE_KEY` 变量内即可。

## 2. 将萌萌哒看板娘抱回家

看板娘的大致设置都可以参考 [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget) 这个项目的介绍。这里我主要记录一下使用上述组件时候，需要调用到的看板娘模型 API 的自建过程。

首先，在宝塔面板创建新站点，设置好 PHP 版本（不能是纯静态），并添加上 SSL 证书。然后，删去网站根目录 `/www/wwwroot/api/` 下默认添加创建的所有文件，确保文件夹全部清空。打开 SSH 终端，把 Live2D API 源代码拉取到网站 `live2d/` 目录：

```sh
cd /www/wwwroot/
git clone https://github.com/fghrsh/live2d_api.git api/live2d
```

然后在网站的配置文件中添加代码设置跨域访问：

```nginx
server
{
    add_header 'Access-Control-Allow-Origin' $allow_origin always;
    add_header 'Access-Control-Allow-Credentials' 'true';
    add_header 'Access-Control-Allow-Methods' 'GET,POST,OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Token,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,X_Requested_With,If-Modified-Since,Cache-Control,Content-Type';
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
map $http_origin $allow_origin {
    default "";
    "~^(https?://localhost(:[0-9]+)?)" $1;
    "~^(https?://127.0.0.1(:[0-9]+)?)" $1; 
    "~^(https?://192.168.10.[\d]+(:[0-9]+)?)" $1;
    "~^(https?://local.zdl.one(:[0-9]+)?)" $1;
    "~^https://dlzhang.com" https://dlzhang.com;
    "~^https://blog.dlzhang.com" https://blog.dlzhang.com;
}
```
因为我的看板娘组件文件都放在了腾讯云的对象存储中并通过其 CDN 进行访问，所以还需要在腾讯云的内容分发网络中对加速域名也设置好允许相关域名跨域访问的权限。