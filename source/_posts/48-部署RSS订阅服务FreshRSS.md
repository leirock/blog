---
title: 部署 RSS 订阅服务 FreshRSS
categories: [科技树]
tags: [服务器, RSS]
pid: 48
date: 2020-04-15 20:30:45
---

![](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/48/rss.png!600x)

RSS 订阅我之前是使用 Inoreader，但是免费版的即使是在 Reeder 客户端下浏览依然是有广告植入的，而且听闻最近在境内已经无法访问了，所以就考虑自建一个。<!--more-->一开始考虑的是 Tiny Tiny RSS，这个之前在腾讯云的学生机上就尝试搭建过。但是订阅源的自动刷新一直搞不定，看了很多教程也没有成功，而且界面设置什么的都不是很喜欢，就放弃了。继续寻找之下找到了 FreshRSS，自带支持 Reeder 客户端访问，不像 Tiny Tiny RSS 还需要安装 fever 插件。

## 1. 安装 FreshRSS

{% note info %}

**注意**：需要确认已经安装了 PHP 扩展 fileinfo。如果使用宝塔面板，可以参考我上一篇文章的说明安装该扩展，此外还需要取消禁用两个函数：openlog 和 syslog（不然安装设置过程中会报错）。

{% endnote %}

接下来在宝塔面板创建新站点，设置好数据库与 PHP 版本（还可以添加上 SSL 证书）：

![创建新站点](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/48/create_site.jpg!500x)

然后，删去网站根目录下默认添加创建的所有文件，确保文件夹全部清空。打开 SSH 终端，把 FreshRSS 源代码拉取到网站根目录：

```sh
cd /www/wwwroot/
git clone https://github.com/FreshRSS/FreshRSS.git rss
```

接下来，我们需要提升网站根目录下 `/data/` 文件夹的访问权限，不然安装设置过程中会报错：

```sh
cd rss
chmod -R 777 ./data
```

接下来我们需要设置一下网站的运行目录，因为根据 FreshRSS 官方文档的说明，推荐只将 `/p/` 目录公开到网络上：

![设置运行目录](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/48/site_path.jpg!500x)

完成后，访问之前创建网站时设置的域名，就可以进入安装设置程序了。

先设置好语言，检查完毕没有缺少的组件和权限后，如下图所示设置数据库（用户名、数据库名根据之前创建的信息填写）：

![数据库配置](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/48/db_settings.jpg!400x)

之后就是设置好自己的用户名密码，完成安装就可以进入 FreshRSS 界面进行登录操作了。

## 2. 客户端访问

要通过 Reeder 等客户端来阅读 RSS 资讯，还需要在设置界面等「认证」中打开「允许 API 访问 」，然后前往「用户帐户」设置好「API 密码」。这样，在 Reeder 客户端添加账号时选择 FreshRSS，然后填写如下：

- Sever：设置「API 密码」时右侧显示的链接地址；
- User：FreshRSS 登录用户名；
- Password：刚才设置的「API 密码」。

## 3. 自动刷新订阅源

根据官方文档推荐的[订阅源刷新方案](https://freshrss.github.io/FreshRSS/en/users/03_Main_view.html#refreshing-feeds)，可以设置 crontab 定时任务如下：

```cron
*/5 * * * * php /www/wwwroot/rss/app/actualize_script.php > /tmp/FreshRSS.log 2>&1
```

其中，`/www/wwwroot/rss/` 是 FreshRSS 网站的根目录路径，上述任务表示每五分钟刷新一次订阅源。在宝塔面板中设置就很简单，在「计划任务」中添加一个 Shell 脚本定时任务就可以了，脚本内容是：

```sh
php /www/wwwroot/rss/app/actualize_script.php > /tmp/FreshRSS.log 2>&1
```