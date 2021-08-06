---
title: Typecho 博客搭建尝试
categories: [科技树]
tags: [Typecho, 服务器]
pid: 50
date: 2020-04-30 17:00:00
update: 2020-10-27 19:00:00
---

拥有一台自己的服务器之后就尝试搞一个动态博客了，毕竟有后台管理会方便很多。看到 Typecho 原生支持 Markdown，而且有一个很漂亮、功能强大的主题 Handsome，就决定尝试将我的 Hexo 博客迁移到 Typecho  Handsome 了。<!--more-->

2020-10-27更新：感觉还是喜欢 Hexo 的博客，就转回去了，期间半年的评论数据大概有四五十条记录，似乎没有特别的价值就懒得从 Typecho 那边转到 Valine 评论里面了。

## 1. Typecho 的个性化

### 1.1 自定义样式

主要的自定义工作我都通过加入自定义 CSS 和 JS 文件来完成了，具体代码可以参考我的 GitHub 项目 [Typecho-Assets](https://github.com/lei2rock/Typecho-Assets) 和 [BanbanStyle 插件](https://github.com/lei2rock/Typecho-Plugin-BanbanStyle)。其中包含了比如随机彩色标签云、中英文字符件自动添加空格（pangu.js）、macOS 风格代码框、今日诗词、看板娘组件等等。

有几个样式或功能还需要一点点额外的配置：

- **删除首页中间标题**：`/usr/themes/handsome/index.php` 删除以下代码

```php
<h1 class="m-n font-thin text-black l-h"><?php $this->options->title(); ?></h1>
```

- **添加今日诗词布局**（需要配合 JS 文件加载今日诗词 SDK）：在上述标签下方找到以下代码

```php
echo '加载中……';
echo '
<script>
  $.ajax({
    type: \'Get\',
    url: \'https://v1.hitokoto.cn/\',
    success: function(data) {
      var hitokoto = data.hitokoto;
      $(\'.indexWords\').text(hitokoto);
    }
  });
</script>';
```

替换为：

```php
echo '
<div class="poem-wrap">
  <span id="poem_sentence">正在加载今日诗词....</span>
</div>';
```

- **文章结尾显示标签**：`/usr/themes/handsomepost.php` 打赏模块结尾添加以下代码

```php
<!--生成当前文章标签-->
<div id="tag_cloud-2" class="post-tags tags l-h-2x" style="text-align:center;margin-top:5px;">
  <style>.post-tags a{font-size:12px!important;color:#fff!important;}</style>
  <?php $this->tags(' ', true, '暂无标签'); ?>
</div>
```

- **页脚更改**：`/usr/themes/handsome/component/footer.php` 第 5-13 行代码

```php
<div class="wrapper bg-light">
  <span class="pull-right hidden-xs text-ellipsis">
    <?php $this->options->BottomInfo(); ?>
    Powered by <a target="_blank" href="http://www.typecho.org">Typecho</a>&nbsp;|&nbsp;Theme by <a target="_blank"
 href="https://www.ihewro.com/archives/489/">handsome</a>
  </span>
  <span class="text-ellipsis">
    &copy;&nbsp;<?php echo date("Y");?> Copyright&nbsp;
    <?php $this->options->BottomleftInfo(); ?>
  </span>
</div>
```

修改为：

```php
<div class="wrapper bg-light">
  <span class="pull-right hidden-xs text-ellipsis">
    <?php $this->options->BottomInfo(); ?>
  </span>
  <span class="text-ellipsis">
    <?php $this->options->BottomleftInfo(); ?>
  </span>
</div>
```

然后就可以直接在主题的「开发者设置」里添加需要的内容了，不会受到原本页脚内容的局限。

- **自定义翻译**：修改 `/usr/themes/handsome/lang/` 文件夹的内容。

### 1.2 PJAX 回调函数

如果开启了 PJAX，一些每次刷新页面都要执行的脚本需要加入回调。目前我根据自定义的 JS 文件设置了以下回调函数。其中最后一条是因为开启了图片延迟加载后，相册页缩略图无法显示。

```javascript
// pangu.js
pangu.spacingPage();

// colorful tag cloud
colorful_tags();

// macOS 代码框
if (typeof Prism !== 'undefined') {
    Prism.highlightAll(true,null);
}

// 今日诗词
if ($("div").hasClass("poem-wrap")) {
    get_poem()
}

// 相册缩略图
$(".album-thumb img").lazyload({
    effect: "fadeIn",
    threshold: "200"
});
```

### 1.3 FancyBox 缩略图

就如在用 Hexo 时候进行的修改一样，我希望在使用 FancyBox 时候预览的缩略图是小图，点开后可以加载原图，这样就需要修改 `/usr/themes/handsome/assets/js/core.min.js` 文件。因为是经过压缩后的版本，所以先恢复回有缩进的版本，然后修改 `seFancyBox` 函数的定义。

找到 `seFancyBox` 函数最后一句：

```javascript
j += i, "undefined" !== f ? b.prop("outerHTML", '<a class="light-link img-blur" data-fancybox="gallery" style="background-image: url(' + g + ')" no-pjax data-type="image" data-caption="' + c + '" href="' + g + '">' + j + "</a>") : b.prop("outerHTML", '<a class="light-link" data-fancybox="gallery" no-pjax data-type="image" data-caption="' + c + '" href="' + g + '">' + j + "</a>")
```

在这一句之前添加（以适配我自己设置的腾讯云对象存储剪裁后缀，如 `!500x`）：

```javascript
g = g.replace(/![0-9]{3,}x/,"");
```

然后再对 `core.min.js` 文件进行压缩保存即可。

## 2. Valine 评论迁移到 Typecho

之前是使用 Valine 搭配 LeanCloud 的评论系统，要迁移到 Typecho 还是蛮复杂的，毕竟没有现成的工具，而且评论的 id 和文章的 id 与 Typecho 格式也不一致。目前是参考一个 [Valine 转 Wordpress 评论的脚本](https://veltlion.github.io/valine-to-wxr/)，自己修改了代码。脚本需要先安装 `jq` 这个 JSON 文件处理包，然后可以实现 JSON 转为 SQL 文件。

```bash
#!/usr/bin/env bash
# by @lei2rock
# Valine to Typecho
# 2020-04-22

comfile="$1"

line=$(grep comment $comfile |wc -l)
author_mail="这里填写自己的邮箱地址"
author_url="这里填写自己的博客链接"
#author_ip="这里填写自己的ip"

comment() {
    for ((i=0; i<$line; i++)); do
        let j=$i+1
        printf "第 $j 条评论\n"
        coid=$(jq -r ".results[$i].objectId" $comfile)
        cid=$(jq -r ".results[$i].url" $comfile)
        cid='['$cid']'
        author=$(jq -r ".results[$i].nick" $comfile)
        mail=$(jq -r ".results[$i].mail" $comfile)
        url=$(jq -r ".results[$i].link" $comfile | sed 's/^null$//')
        ip=$(jq -r ".results[$i].ip" $comfile | sed 's/^null$//')
        dateYMD=$(jq -r ".results[$i].createdAt" $comfile | sed 's/T/ /; s/\.[0-9]\{3\}Z//')
        date=$(date -d "$dateYMD" +%s)
        parent=$(jq -r ".results[$i].rid" $comfile | sed 's/^null$/0/')
        text=$(jq -r ".results[$i].comment" $comfile)
        agent=$(jq -r ".results[$i].ua" $comfile)
        if [[ $mail == $author_mail ]]; then
            authorId=1
            ownerId=1
            url=$author_url
#           ip=$author_ip
        else 
            authorId=0
            ownerId=0
        fi
        if [[ $j == $line ]]; then
            echo  "($coid, ""'""$cid""'"", $date, ""'""$author""'"", $authorId, $ownerId, ""'""$mail""'"", ""'""$url""'"", ""'""$ip""'"", ""'""$agent""'"", ""'""$text""'"", ""'""comment""'"", ""'""approved""'"", $parent);">>$comfile.sql
        else
            echo  "($coid, ""'""$cid""'"", $date, ""'""$author""'"", $authorId, $ownerId, ""'""$mail""'"", ""'""$url""'"", ""'""$ip""'"", ""'""$agent""'"", ""'""$text""'"", ""'""comment""'"", ""'""approved""'"", $parent),">>$comfile.sql
        fi
    done
}

touch $comfile.sql
echo  "INSERT INTO \`typecho_comments\` (\`coid\`, \`cid\`, \`created\`, \`author\`, \`authorId\`, \`ownerId\`, \`mail\`, \`url\`, \`ip\`, \`agent\`, \`text\`, \`type\`, \`status\`, \`parent\`) VALUES">>$comfile.sql
comment
echo done!
```

保存该文件命名为 `valine2typecho.sh`，重命名 LeanCloud 导出的 Valine 评论文件为 `comment.json`，然后在这两个文件所在目录执行以下命令：

```bash
sh valine2typecho.sh comment.json
```

之后可能需要一些手工调整（所以评论数少的话可以用）：例如调整评论的 `coid`、文章的 `cid`，修正一些 SQL 可能不支持的格式（比如部分字符要转义），一些 html 标签要在后台评论设置中添加支持，修改部分评论的 `parent` 值以匹配相应上级评论等等，具体可以参考 MySQL 导出的数据库文件格式。

导入评论后文章统计的评论数量可能不准确，可以先备份数据库，然后数据库中执行以下语句：

```sql
UPDATE typecho_contents t1 SET t1.commentsNum = (select count(*) from typecho_comments t2 where t2.cid = t1.cid)
```

## 3. 插件介绍

介绍一下自己在用的插件，也推荐了一些其他不错的插件，都是在 GitHub 上开源免费的插件。

### 3.1 在使用的插件

| 插件                                                         | 介绍                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [BanbanStyle](https://github.com/lei2rock/Typecho-Plugin-BanbanStyle) | 为我自己的博客设置而开发的插件，功能见 GitHub 项目介绍       |
| [CommentToMail](https://github.com/JoyChou93/CommentToMail)  | 评论邮件通知，可以参考我的邮件模板：[通知博主](https://github.com/lei2rock/Typecho-Assets/plugins/CommentToMail/owner.html)、[通知访客](https://github.com/lei2rock/Typecho-Assets/plugins/CommentToMail/guest.html) |
| Handsome                                                     | Handsome 主题配套插件                                        |
| [Sitemap](https://github.com/bayunjiang/typecho-sitemap)     | 自动生成网站地图                                             |
| [cosUploadV5](https://github.com/dishcheng/cosUploadV5)      | 上传文件、图片到腾讯云对象存储并提供链接                     |
| [MemorialDay](https://github.com/lei2rock/Typecho-Plugin-MemorialDay) | 自己开发的哀悼日开启全站黑白滤镜                             |

### 3.2 其他推荐的插件

| 插件                                                         | 介绍                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [Comment2Wechat](https://github.com/YianAndCode/Comment2Wechat) | 评论推送至微信，依托 Server 酱实现                           |
| [Comment2Telegram](https://github.com/MoeLoli/Comment2Telegram) | 评论推送至 Telegram，支持回复评论、通过评论、垃圾评论和删除评论 |
| [macOScode](https://github.com/lei2rock/Typecho-Plugin-macOScode) | 自己开发的实现 macOS 风格代码框，应该只适配 Handsome 主题    |
| [EditorMD](https://github.com/DT27/EditorMD)                 | 比原生更好用的 Markdown 编辑器（可以只使用编辑器功能）       |

## 4. Handsome 主题时光机

Handsome 主题内置了一个「时光机」功能，可以类似微博、微信朋友圈一样发布动态，而且支持通过微信公众号、Chrome 插件等多平台发布。同时，还可以在该页面上利用 RSS 订阅源把自己的微博和 Twitter 等平台的动态同步显示。

### 4.1 多平台发布动态

Handsome 开发者提供了一个微信公众号发布的渠道，但是这样需要用到别人的服务，而且后期如果要添加新的网站等都需要在该平台修改，不是很方便。既然有自己的服务器，还有自己的微信公众号，那就不如自己搭建一个。

1. 首先下载 [wechat_for_handsome](https://github.com/iLay1678/wechat_for_handsome) 项目到自己服务器目录，我们可以添加一个新的网站和域名来部署，同时需要创建一个对应的数据库。

2. 在安装该服务前，我们需要先去微信公众号后台获取必要的设置参数。在微信公众号后台「开发-基本配置」处获取 AppID 和 AppSecret。然后我们参照微信公众号的[文档](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)，使用刚才获得的两个参数在 [微信公众平台接口调试工具](https://mp.weixin.qq.com/debug/cgi-bin/apiinfo?t=index&type=基础支持&form=获取access_token接口%20/token) 获取 `access_token`。

   ![服务器配置](https://website-1256060851.cos.ap-hongkong.myqcloud.com/posts/50/wechat-channel-server.jpg!600x)

3. 接下来回到微信公众号后台「开发-基本配置」处启用服务器配置。服务器地址（URL）填写为「项目域名/server.php」；令牌（Token）就是第二步得到的 `access_token`；消息加解密密钥（EncodingAESKey）可以随机生成但是一定要记录，因为我们还需要在项目安装时候填写；消息加解密方式可以选择「安全模式」。因为还没有在服务器上安装，所以先不要提交，放一边，进入下一步。

4. 回到之前添加的站点，访问「项目域名/install.php」进入安装步骤。依次输入要求的几个参数，这些我们都通过上面的几个步骤获得了，设置完毕后安装即可。这样就可以回到第三步的公众号服务器配置，提交验证。

5. 然后向公众号发送「绑定」，点击链接填写相关信息进行绑定，绑定完毕就可以参考主题文档的说明发布动态了。如果没有反应，可能是刚刚验证完毕，稍微等一会儿就好。其中，时光机的 `cid` 可以在后台独立页面管理处获得，验证编码可以在主题设置处自行设置一个当作访问密码。

6. 如果公众号启用了「服务器配置」后，自定义的菜单不见了，可以在功能插件设置处重新启用即可。Chrome 扩展发布动态的方法可以直接参考主题文档配置。

### 4.2 添加 RSS 订阅源

时光机上要显示自己的微博或者 Twitter 的动态，可以借助 RSSHub 生成的订阅源。RSSHub 的部署可以参考我之前的文章，其中 Twitter 还需要去申请获得 API 相应的 key 才可以访问。

当然，使用的时候不能直接填写这个订阅源，因为会被禁止跨域访问，这时候可以在该订阅源链接前面加上 `https://cors-anywhere.herokuapp.com/`。例如我们要订阅微博的 RSS 订阅源链接是 `https://rsshub.app/weibo/user/{weibo_user_id}`，那么为了方便跨域访问，可以在时光机设置时候填写:

```http
https://cors-anywhere.herokuapp.com/https://rsshub.app/weibo/user/{weibo_user_id}
```

当然，可能通过访问 herokuapp.com 来获取订阅源速度比较慢，那就可以自行部署这个 [CORS Anywhere 服务](https://github.com/Rob--W/cors-anywhere)。方法也很简单，以使用宝塔面板为例，因为部署该项目使用的是 Nodejs 环境，需要先安装 Nodejs，方法可以参考我之前的文章。

然后下载上述项目源码到需要部署的服务器目录，项目根目录下创建环境变量设置文件 `.env`，编辑文件添加环境变量（具体含义用法见该项目文档），例如：

```env
PORT = 1400
CORSANYWHERE_WHITELIST = https://blog.dlzhang.com,https://rss.zdl.one
```

之后安装所需要的依赖（以下命令二选一）:

```shell
# yarn 安装方式
yarn
yarn add dotenv # 调用环境变量文件需要的依赖

# npm 安装方式
npm install
npm install dotenv --save # 调用环境变量文件需要的依赖
```

修改启动文件 `server.js`，在最开头加入以下内容，以便在最开始就引入环境变量文件的参数：

```js
// Import .env
let dotenv = require('dotenv');
dotenv.config('./env');
```

可以手动启动，或者用「PM2 管理器」启动，选择启动文件为 `server.js` 即可。

```shell
node server.js
```

最后，为服务设置反向代理，使得可以通过域名访问该服务。

## 5. 访问速度与安全

### 5.1 CDN

最开始是静态资源走腾讯云境内 CDN（存储在对象存储中），毕竟腾讯云每个月有 10G 免费境内 CDN 流量包可以使用。但是测试和实际使用发现，如果只是使用境内 CDN 分发静态资源，海外访问的时候会有「云减速」的效果，但是如果开启全球加速，海外访问的流量费也是一笔钱。

而如果选择 Cloudflare 的 CDN，似乎对境内访问有「云减速」的效果。如果是 DNS 双线解析，境内直接访问服务器，境外访问 Cloudflare 的 CDN（可以通过 Cloudflare Partner 面板实现 CNAME 接入）， 可以让海外访问走 CDN，不过感觉对境内一样是源站访问的话用 CDN 意义不算很大。而且，因为目前服务器和我同地域，访问延迟特别低，体验很好，加上 Cloudflare 的 CDN，纵使是境外也感觉有「云减速」的效果，似乎没有给我选择最近的节点或者是回源获取资源了吧。

反正经过几番尝试，最后还是只选择了主题的静态文件直接放到 GitHub，借助 jsDelivr 的 CDN 进行分发。自定义的静态文件也放到了 GitHub，但主要是版本控制的目的，毕竟 jsDelivr 的 CDN 缓存刷新速度不是那么快的。我采用 GitHub Actions 同步到腾讯云对象存储中，直接用对象存储的链接进行访问，感觉这样并没有比采用加速域名走 CDN 慢。

目前没有用 memcached 或者 redis 作内容缓存，其一是并没有很大的并发需求，其二是 Typecho 没有好用的插件（或多或少有一些问题）。

### 5.2 Google BBR

Google BBR 是一个 TCP 加速优化工具，可用于优化TCP连接，根据介绍开启可以加快访问的网速，这里参考了 [Rat 介绍的方法](https://www.moerats.com/archives/297/)：

```shell
# 修改系统变量
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf

# 保存生效开启 BBR
sysctl -p

# 查看内核是否已开启 BBR
sysctl net.ipv4.tcp_available_congestion_control

# 查看 BBR 是否启动
lsmod | grep bbr
```

显示以下即内核已开启 BBR：

```shell
# sysctl net.ipv4.tcp_available_congestion_control
net.ipv4.tcp_available_congestion_control = bbr cubic reno
```

显示类似以下内容即 BBR 启动成功：

```shell
# lsmod | grep bbr
tcp_bbr                20480  14
```

### 5.3 TLS 与 HSTS

宝塔面板安装最新版本，Nginx 安装 1.17 版本的话，应该已经支持了 TLS 1.3 协议，可以在 [ssllabs.com](https://www.ssllabs.com/ssltest/) 或者 [myssl.com](https://myssl.com/) 测试一下自己的站点。为了在上述测试中实现 A 的评级，获得 SSL 证书后，我还在 Nginx 中禁用了 TLS 1.1 协议：删除服务器所有网站 Nginx 配置文件中的 `TLSv1.1`。

```diff
-ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
+ssl_protocols TLSv1.2 TLSv1.3;
```