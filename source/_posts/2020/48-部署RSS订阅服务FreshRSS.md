---
title: 部署 RSS 订阅服务 FreshRSS
categories: [笔记]
tags: [服务器, RSS]
pid: 48
cc_license: true
date: 2020-04-15 20:30:45
updated: 2021-09-15 22:18:00
---

RSS 订阅我之前是使用 Inoreader，但是免费版的即使是在 Reeder 客户端下浏览依然是有广告植入的，而且听闻最近在境内已经无法访问了，所以就考虑自建一个。

一开始考虑 Tiny Tiny RSS，这个之前在腾讯云的学生机上就尝试搭建过。但是订阅源的自动刷新一直搞不定，看了很多教程也没有成功，而且界面设置什么的都不是很喜欢，就放弃了。

继续寻找之下找到了 FreshRSS，Reeder 客户端自带支持访问，也提供 fever api。不像 Tiny Tiny RSS 还需要安装 fever 插件。
<!--more-->

## 1. 安装 FreshRSS

{% note info %}
#### 注意
需要确认已安装 PHP 扩展 fileinfo。如使用宝塔面板，可参考上一篇文章的说明安装该扩展，此外还需要取消禁用两个函数：openlog 和 syslog（不然安装设置过程中会报错）。
{% endnote %}

接下来在宝塔面板创建新站点，设置好数据库与 PHP 版本（还可以添加上 SSL 证书）：

![创建新站点](https://cos.pinlyu.com/post/2020/48-create_site.webp#500x)

然后，删去网站根目录下默认添加创建的所有文件，确保文件夹全部清空。打开 SSH 终端，把 FreshRSS 源代码拉取到网站根目录：

```bash
cd /www/wwwroot/
git clone https://github.com/FreshRSS/FreshRSS.git rss
```

接下来，我们需要提升网站根目录下 `/data/` 文件夹的访问权限，不然安装设置过程中会报错：

```bash
cd rss
chmod -R 777 ./data
```

接下来我们需要设置一下网站的运行目录，因为根据 FreshRSS 官方文档的说明，推荐只将 `/p/` 目录公开到网络上：

![设置运行目录](https://cos.pinlyu.com/post/2020/48-site_path.webp#500x)

完成后，访问之前创建网站时设置的域名，就可以进入安装设置程序了。

先设置好语言，检查完毕没有缺少的组件和权限后，如下图所示设置数据库（用户名、数据库名根据之前创建的信息填写）：

![数据库配置](https://cos.pinlyu.com/post/2020/48-db_settings.webp#400x)

之后就是设置好自己的用户名密码，完成安装就可以进入 FreshRSS 界面进行登录操作了。

## 2. 客户端访问

要通过 Reeder 等客户端来访问，还需要在设置的“认证”中打开 `允许API访问`，然后前往“用户帐户”设置好“API 密码”。这样，在 Reeder 添加账号时选择 FreshRSS，然后填写如下：

- `Sever`：设置“API 密码”时右侧显示的链接地址；
- `User`：FreshRSS 登录用户名；
- `Password`：刚才设置的“API 密码”。

## 3. 自动刷新订阅源

根据官方文档推荐的[订阅源刷新方案](https://freshrss.github.io/FreshRSS/en/users/03_Main_view.html#refreshing-feeds)，可以设置 crontab 定时任务如下：

```cron
*/5 * * * * php /www/wwwroot/rss/app/actualize_script.php > /tmp/FreshRSS.log 2>&1
```

其中，`/www/wwwroot/rss/` 是 FreshRSS 网站的根目录路径，上述任务表示每五分钟刷新一次订阅源。在宝塔面板中设置就很简单，在“计划任务”中添加一个 Shell 脚本定时任务就可以了，脚本内容是：

```bash
php /www/wwwroot/rss/app/actualize_script.php > /tmp/FreshRSS.log 2>&1
```

## 4. Docker Compose 部署

{% note info %}
#### 2021-09-15 更新
目前 FreshRSS 已经支持 Docker 安装，建议直接采用 [Docker Compose](https://github.com/FreshRSS/FreshRSS/blob/edge/Docker/docker-compose.yml) 部署。
{% endnote %}

```yaml
version: "3"

services:
  freshrss:
    image: freshrss/freshrss:latest
    container_name: freshrss
    hostname: freshrss-app
    restart: always
    ports:
      - '8010:80'
    volumes:
      - ./data:/var/www/FreshRSS/data
      - ./extensions:/var/www/FreshRSS/extensions
    environment:
      CRON_MIN: '*/20' # 刷新频率
      TZ: Asia/Shanghai
```

Docker 启动后可以在 `data/config.php` 中进行相关设置。因为是 Docker 启动后使用反向代理，需要先设置好 `base_url` 的访问域名。另外，这里数据库我选择了 SQLite。设置好之后，重新启动一下容器即可生效。

```php
  'db' => 
  array (
    'type' => 'sqlite',
    'host' => false,
    'user' => false,
    'password' => false,
    'base' => false,
    'prefix' => false,
    'connection_uri_params' => '',
    'pdo_options' => 
    array (
    ),
```