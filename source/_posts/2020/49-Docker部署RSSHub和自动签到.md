---
title: Docker 部署 RSSHub 和自动签到
categories: [笔记本]
tags: [服务器, Docker, RSS]
pid: 49
cc_license: true
date: 2020-04-15 23:30:50
updated: 2022-04-19 09:34:00
---

## 1. RSSHub：万物皆可 RSS

因为有些网站或者媒体没有主动提供 RSS 订阅链接，所以我们就可以依靠 [RSSHub](https://docs.rsshub.app) 这一个开源、简单易用、易于扩展的 RSS 生成器，给任何奇奇怪怪的内容生成 RSS 订阅源。<!--more-->

首先需要先安装 Docker Compose，参照[文档说明](https://docs.docker.com/compose/install/)：

```shell
# 下载 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 设置访问权限
sudo chmod +x /usr/local/bin/docker-compose

# 查看安装版本
docker-compose --version
```

接下来安装RSSHub：

```shell
# 下载 docker-compose.yml (按需设置环境变量进行配置)
wget https://raw.githubusercontent.com/DIYgod/RSSHub/master/docker-compose.yml

# 创建 volume 持久化 Redis 缓存
docker volume create redis-data

# 启动 Docker
docker-compose up -d

# 更新：先执行以下命令删除旧容器，然后重复上述安装步骤
docker-compose down
```

## 2. 自动签到应用

我正在使用的自动签到项目 [qiandao-today/qiandao](https://github.com/qiandao-today/qiandao) 源自 [binux/qiandao](https://github.com/binux/qiandao)。

采用 Docker Compose 部署的方法，按照项目说明配置好 [环境变量](https://github.com/qiandao-today/qiandao#configpy-配置环境变量) 即可快速部署。注册登录后在控制台可以进行偏好设置和签到配置，相比于老项目的步骤简单方便很多。

```shell
# 创建并切换至 qiandao 目录
mkdir -p $(pwd)/qiandao/config && cd $(pwd)/qiandao

# 下载 docker-compose.yml
wget https://cdn.jsdelivr.net/gh/qiandao-today/qiandao@master/docker-compose.yml

# 根据需求和配置描述修改配置环境变量
vi ./docker-compose.yml

# 执行 Docker Compose 命令
docker-compose up -d
```