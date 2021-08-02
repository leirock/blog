---
title: 升级到 Debian 10 并安装宝塔面板
categories: [科技树]
tags: [服务器, Linux, 宝塔面板]
pid: 46
date: 2020-04-15 18:30:37
---

![](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/46/linux.jpg!600x)

近日入手了一个阿里云的轻量应用服务器，看着价格还比较实惠，就打算把自己的博客也搬过去。服务器买都买了，当然还要折腾一下其他有趣的应用和服务，比如 RSS 订阅、RSSHub、自动签到、Live2D API 等等<!--more-->~~（其实是为了部署服务才买了服务器，顺带迁移了博客站点）~~。所以就在这里记录一下搭建的过程，方便日后维护和重装部署。

## 1. 系统升级到 Debian 10

作为代码小白，当然是无脑选择使用宝塔面板。阿里云的控制台可以直接安装宝塔面板，不过因为搭配的系统是 CentOS，感觉不是很习惯，就直接选择了先安装 Debian 9 系统，然后自行升级的方式。

作为更新强迫症患者中，当然是要先把系统更新到最新版本啦，这里主要参考了[葉子的操作](https://niconiconi.fun/2019/06/14/debian-9-upgrade-debian-10/)。升级到 Debian 10 （版本代号 buster）之前请确认你没有添加过奇怪的软件源，或者编译过一些未知的东西，如果有的话请了解一下之前的操作会不会对系统造成损伤，如果有的话不建议升级，容易出问题。因此，如果不是全新系统升级，建议先进行备份。

因为我的是全新系统，就没有备份环节啦。建议先将本地软件更新到最新版，然后再升级 Debian 不然很有可能会出现一些未知的问题，本次升级基于官方源进行。

```sh
# 更新软件索引
sudo apt update
# 更新本地所有软件到最新版
sudo apt full-upgrade
# 切换 stretch 源到 buster 源
sudo sed -i 's/stretch/buster/g' /etc/apt/sources.list
# 再次更新软件索引
sudo apt update
# 升级 Debian 9 stretch 到 Debian 10 buster
sudo apt upgrade
# 重启服务器
sudo reboot
```

由于是跨版本升级，在第五个命令的升级过程中很多地方需要我们手动设置或确认：

- 首先需要确认的是 apt， 感兴趣的可以看一下具体参数设置，直接输入 `q` 进行安装；

- 之后可能会跳出 Configuring kexec-tools，Configuring kdump-tools 和 Configuring libc6:amd64 的确认窗口，这里选择 `<Yes>`；

- 接下来就和平时更新差不多了，遇到冲突选择 `Y or I` 使用更新配置，还是 选择 `N or O` 保留已有配置，或者其他选项。我个人因为是全新安装升级，所以都选择了 `Y` 使用更新配置。

## 2. 安装宝塔面板

参考宝塔官网给出的安装命令安装宝塔面板：

```sh
curl -sSO http://download.bt.cn/install/install_panel.sh && bash install_panel.sh
```

安装完毕后就会显示面板的访问路径、默认的登录用户名密码等信息。这里需要注意的是，我们需要先去云服务器的控制台安全组（防火墙）处先把宝塔面板访问的默认端口 8888 放通，要不然是无法访问面板的。

在浏览器登录宝塔面板后，就会跳出推荐安装套件的窗口。选择 LNMP 套件极速安装，版本上因为我的机器内存只有 1G，所以就选择了 MySQL 5.5 的版本，其他都选择了最新版本。

![推荐安装套件](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/46/LNMP.jpg!500x)

{% note info %}

**注意**：如果发现下载时无法连接到宝塔的下载地址（特别是境外服务器），可能需要先在首页的「Linux 工具箱」中临时修改一下「DNS 设置」，例如使用 1.1.1.1 或者 8.8.8.8。

{% endnote %}

安装完推荐套件后，继续在「软件商店」中安装其他需要的软件，我们这里选择安装：

- [运行环境] Docker 管理器：方便后续安装 RSSHub 和自动签到服务；
- [运行环境] PM2 管理器：Nodejs 服务可以通过其管理，如果安装 Nodejs 失败，可以使用 `nvm` 手动安装，方法参考 [nvm-sh/nvm](https://github.com/nvm-sh/nvm) 的说明，可能需要指定好路径才能正确使用（具体可以参考 [解决 nvm command not found 问题的方法](https://www.cnblogs.com/weifeng1463/p/11321432.html)）；
- [系统工具] 日志清理工具：可以一键清理指定日志和系统垃圾；
- [插件] 阿里云 OSS：将网站或数据库打包备份到阿里云 OSS 对象存储空间，在阿里云同一地域下的云产品之间还可以通过内网地址连接，既能提高连接速度，也能减少流量费用；
- [第三方应用] Nginx 免费防火墙。

不过，安装完毕设置阿里云 OSS 参数插件之前，执行以下命令，不然可能无法正常执行备份操作（提示：`ImportError: No module named oss2`）：

```sh
pip install oss2
```

对于 PHP，我们可以在「性能调整」中根据自己的内存大小修改并发方案，还可以选择安装以下扩展：

- fileinfo：FreshRSS 需要此扩展
- opcache：开启脚本缓存可以提高 PHP 运行性能
- redis：内容缓存

{% note info %}

**注意**：内存只有 1G 的服务器可能无法安装 fileinfo，这时候需要我们在「Linux 工具箱」的「Swap/虚拟内存」中添加 Swap，我们可以设置如 1024MB 或者 1500MB。

{% endnote %}

软件安装完毕后，可以进入「面板设置」，修改默认的访问端口、登录用户名密码等信息，还可以为面板绑定访问域名并添加 SSL 证书。

对于 FTP 工具，本地可以使用 FileZilla 软件，使用方法可以参考宝塔面板的[论坛帖子](https://www.bt.cn/bbs/thread-43162-1-1.html)。