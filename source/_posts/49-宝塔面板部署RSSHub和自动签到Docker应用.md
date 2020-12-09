---
title: 宝塔面板部署 RSSHub 和自动签到 Docker 应用
categories: [科技树]
tags: [服务器, Docker, RSS]
pid: 49
date: 2020-04-15 23:30:50
---

![](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/49/docker.png!600x)

使用宝塔面板下部署 Docker 应用还是挺容易的，首先需要安装 Docker 管理器。不过这个管理器在 Safari 浏览器中似乎有 bug，无法进行点击操作，但是在 Chrome 浏览器中可以正常操作。本文将通过这个 Docker 管理器来安装 RSSHub 这一 RSS 生成器和一个自动签到应用。<!--more-->

## 1. RSSHub：万物皆可 RSS

因为有些网站或者媒体没有主动提供 RSS 订阅链接，所以我们就可以依靠 RSSHub 这一个开源、简单易用、易于扩展的 RSS 生成器，给任何奇奇怪怪的内容生成 RSS 订阅源。

### 1.1 Docker 部署

首先，打开 Docker 管理器，在「镜像管理」中获取官方库镜像 `diygod/rsshub`。

![获取镜像](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/49/docker_mirror.jpg!500x)

然后，在「容器列表」创建新的 Docker 容器：

![创建 RSSHub 容器](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/49/rsshub_docker.jpg!400x)

这里我们设置了：

- 容器端口 1200 映射到服务器端口 1200；
- 服务器目录 `/www/wwwroot/rsshub/` 可以读写容器目录 `/usr/src/app/`；
- CPU 权重改为 30。

然后，我们创建一个新的网站，不需要创建新的数据库，PHP 设置为纯静态。把文章根目录下的文件都清空，然后把 RSSHub 源代码拉取到网站根目录 `/www/wwwroot/rsshub/`。这样的目的是以后有需要，可以直接修改该目录下的文件，而不需要进入 Docker 容器进行修改。

```sh
cd /www/wwwroot/
git clone https://github.com/diygod/rsshub.git rsshub
```

最后，设置反向代理，以便我们可以通过域名来访问该服务：

![反向代理](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/49/reverse_proxy.jpg!500x)

这样，我们的 RSSHub 就完成了搭建，具体的配置和路由可以参见 [RSSHub 文档](https://docs.rsshub.app)。

### 1.2 Docker Compose 部署

当然，我们也可以通过 Docker Compose 部署 RSSHub，部署步骤很简单，直接参考 RSSHub 文章介绍即可。部署完毕后也会显示在上面提及的 Docker 管理器中。

当然首先需要先安装  Docker Compose，参照[文档说明](https://docs.docker.com/compose/install/)：

```shell
# 下载 Docker Compose 稳定发布版
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 设置访问权限
sudo chmod +x /usr/local/bin/docker-compose

# 查看安装版本
docker-compose --version
```

接下来安装RSSHub：

```shell
# 下载 docker-compose.yml
wget https://raw.githubusercontent.com/DIYgod/RSSHub/master/docker-compose.yml

# 创建 volume 持久化 Redis 缓存
docker volume create redis-data

# 启动 Docker
docker-compose up -d

# 更新：先执行以下命令删除旧容器，然后重复上述安装步骤
docker-compose down
```

如果要添加配置，可以修改 [docker-compose.yml](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml) 中的 `environment` 进行配置。

## 2. 自动签到应用

[qiandao.today](https://qiandao.today) 这个网站提供了自动签到的服务，上面提供了许多网站自动签到的模板。我们也可以利用公开的源代码自己搭建一个这样的自动签到应用。

### 2.1 部署容器

这里采用 Docker Compose 部署的方法，比较方便快捷。首先创建一个 `docker-compose.yml`（目录任意，为方便管理可以放在站点的目录下）：

```yaml
version: '3'

services:
    qiandao:
        image: fangzhengjin/qiandao #容器镜像
        container_name: qiandao #设置容器名称
        restart: always #表示重启 docker 后自动重启该容器
        ports:
            - '1300:80' #表示容器的 80 端口映射到服务器的 1300 端口
```

该目录下执行以下命令可以：启动、停止、移除容器。

```shell
# 启动
docker-compose up -d

# 停止（不需要在该目录下执行）
docker stop qiandao

# 移除
docker-compose down
```

接下来我们按照前面介绍的方法设置反向代理，这样就可以访问之前设置的域名注册账号，再把该账号设置为管理员：

```shell
# 进入容器管理（也可通过宝塔面板 Docker 管理器进入）
docker exec -it qiandao /bin/bash

# 设置站点管理员（邮箱需要已注册）
python ./chrole.py admin@example.com admin

# 退出容器管理
exit
```

### 2.2 获取 Cookies

签到模板可以从 [qiandao.today](https://qiandao.today) 下载，具体使用方法可以查阅官方文档。对于需要获取 Cookies 进行签到的网站，我们可以安装 Chrome 扩展应用 [GetCookies](https://chrome.google.com/webstore/detail/cookies-get-assistant/ljjpkibacifkfolehlgaolibbnlapkme)。但是，这里下载安装的只限用于 qiandao.today 这个网站。如果我们要在自己搭建的签到网站获取 Cookies，可以：

- 从 GitHub 下载[该项目的源代码](https://github.com/acgotaku/GetCookies)；
- 全局搜索 `qiandao.today`，替换为自己的签到网站域名并保存；
- 在 Chrome 浏览器的扩展程序管理页面（chrome://extensions），选择「加载已解压的扩展程序」，将刚才已经编辑过的扩展程序文件夹上传安装即可。

### 2.3 配置与备份数据

如果不希望别人访问我们的签到网站注册账号，可以把 `/web/handlers/login.py` 文件第 66-130 行的代码注释掉（前后均写上 `'''`）。编辑好该文件后，在该文件目录执行以下命令把文件复制到容器内：

```shell
# 把文件复制到容器内
docker cp login.py qiandao:/usr/src/app/web/handlers/

# 重启容器
docker restart qiandao
```

要备份我们的数据信息，可以执行如下命令，建议恢复数据库后立即重启容器（方法同上）。

```shell
# 将容器中的数据库文件复制到当前目录
docker cp qiandao:/usr/src/app/database.db .

# 将备份的数据库复制到容器中（当前目录的 database.db 文件）
docker cp database.db qiandao:/usr/src/app/
```

调整相关配置，可以修改 `config.py` 文件，复制到容器方法和备份数据库文件到方法一样。