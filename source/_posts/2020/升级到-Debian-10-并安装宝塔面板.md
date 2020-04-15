---
title: 升级到 Debian 10 并安装宝塔面板
categories: [随手记]
tags: [服务器, Linux, 宝塔面板]
date: 2020-04-15 18:30:37
---

近日入手了一个阿里云的轻量应用服务器，香港节点 24 元/月，看着价格还比较实惠，就打算把自己的博客也搬过去。作为代码小白当然是无脑选择使用宝塔面板，阿里云的轻量应用服务器在控制台可以直接安装宝塔面板。不过因为搭配的系统是 CentOS，感觉不是很习惯，就直接选择了先安装 Debian 9 系统，然后自行升级的方式。<!-- more -->

从本文开始就记述一下服务器搭建部署的过程，主要会分为以下几个部分记录：

- 升级 Debian 系统并安装和配置宝塔面板；
- Hexo 静态博客通过 GitHub Actions 部署到服务器；
- 搭建 FreshRSS 资讯订阅服务；
- Docker 部署 RSSHub 和自动签到服务；
- Live2D API 的部署和博客加入看板娘插件。

## 1. 系统升级到 Debian 10

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

![推荐安装套件](https://web-1256060851.file.myqcloud.com/images/2020/升级到-Debian-10-并安装宝塔面板/LNMP.jpg!500x)

{% note info %}

**注意**：如果发现下载安装时候无法连接到宝塔的下载地址（特别是境外服务器），可能需要先在首页的「Linux 工具箱」中修改一下「DNS 设置」，例如把 1.1.1.1 或者 8.8.8.8 加入 DNS 解析服务器列表。

{% endnote %}

安装完推荐套件后，继续在「软件商店」中安装其他需要的软件，我们这里选择安装：

- [运行环境] Docker 管理器：方便后续安装 RSSHub 和自动签到服务；
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

## 3. 通过 GitHub Actions 部署 Hexo

在服务器上部署 Hexo 静态博客有两种方案，一是直接把源代码推送到服务器上，然后在服务器上安装 Node.js 和 hexo-cli，从而直接在服务器上构建网页文件并部署；二是依旧按照之前部署到对象存储的方案，用 GitHub 作为源代码托管，然后用 GitHub Actions 构建网页文件，再同步到服务器的网站根目录下。

这里，我选择后一种方案，这样修改的地方比较少，也比较方便。首先，修改原来的 GitHub Actions 脚本，删去部署到阿里云 OSS 的内容，添加如下内容：

```yaml
- name: Deploy to server
  uses: easingthemes/ssh-deploy@v2.0.9
  env:
    SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }} # 配置在服务器上公钥所对应的私钥
    ARGS: "-avz --delete"
    SOURCE: "public/" # 要同步到服务器的目录
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

---

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

然后，我们把私钥的内容复制到 GitHub 代码仓库设置的 Secrets 中 `SSH_PRIVATE_KEY` 变量内即可。