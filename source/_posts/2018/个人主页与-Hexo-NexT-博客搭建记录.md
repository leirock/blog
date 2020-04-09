---
title: 个人主页与 Hexo NexT 博客搭建记录
categories: [随手记]
tags: [blog, 技术]
date: 2018-06-06 18:03:02
---

最近把 [个人主页](https://dlzhang.com) 与 [博客](/) 都重新设计了，所以就打算写个总结，自己记录一下一些细节。虽然自认为不会有几个访客，但还是进行了相应的区别定位。个人主页主要是展现个人的简历、研究项目等内容，主要是个人展示目的；博客偏向于个性化一些，主要想进行一些生活日常或者研究过程等记录，也可以展现一些自己的兴趣爱好之类的东西。<!-- more -->

## 1. 域名与解析
购买到合适的域名之后，就需要把网站通过 DNS 解析到对应的域名上，我的网站 DNS 解析由 Cloudflare 提供。目前的个人主页与博客都放在 [Netlify](https://www.netlify.com) 上，由 Netlify 获取 GitHub 对应的项目仓库内容自动进行网站页面生成与部署。所以直接在 Netlify 对应的项目中添加好域名，再根据提示去设置解析。

![Cloudflare DNS 设置](https://web-1256060851.file.myqcloud.com/images/2018/个人主页与-Hexo-NexT-博客搭建记录/dns.png!600x)

上图中主机记录 `Name` 就是我们希望网站访问时的域名，如果我们的域名是 `example.com`，那么设置好主机记录后我们的访问域名也即 `主机记录.example.com`。当主机记录为 `@` 时，对应就是直接访问我们的根域名。记录值 `Value` 填写的是 Netlify 上对应项目的二级域名地址。

设置好 DNS 解析后，还需要在域名注册商处把域名指向 Cloudflare 提供的两个 NameServer 解析服务器才可以正常访问。

采用 HTTPS 可以使得浏览数据更加安全，并防止网络运营商对网页进行劫持和插入广告。Netlify 提供由 Let's Encrypt 颁发的免费证书来开启强制 HTTPS，直接在管理界面就可以点击开启。对于部署在 GitHub Pages上的情况，只需要在 repository 的页面点击 Settings，在 `GitHub Pages` 下面把 `Enforce HTTPS` 打勾即可。

## 2. Hexo 初始化

### 2.1 环境配置

{% note info %} 
**提示**：macOS 在编译时候可能会提示没有缺少 Command Line Tools，需要在终端输入 `xcode-select --install`，然后根据提示安装。
{% endnote %}

要使用 Hexo NexT 主题的博客，需要先配置好环境，安装 [Node.js](http://nodejs.org/) 和 [Git](https://git-scm.com/downloads)。安装完成后，在终端中输入以下命令安装 Hexo：

```sh
sudo yarn global add hexo-cli #需要输入密码确认，或者 npm install -g hexo-cli
```

安装 Hexo 完成后，执行下列命令会在指定文件夹中新建所需要的文件：

```sh
hexo init <folder-path>  #在指定文件夹中初始化 Hexo
cd <folder-path>  #定位到 Hexo 博客目录
yarn install #或者 npm install
```

新建完成后，指定文件夹的目录中：

- `_config.yml` 站点配置文件，具体配置的说明可以查看相关 [文档](https://hexo.io/zh-cn/docs/configuration.html)。
- `themes` 主题文件夹，Hexo 会根据主题来生成静态页面。
- `source` 文件夹是存放用户资源的地方，Markdown 和 HTML 文件会被解析并放到 `public` 文件夹，而其他文件会被复制过去（如 `CNAME` 文件）。

### 2.2 新建文章与页面
使用以下第一句可以在 `source/_post/` 文件夹下新建一篇文章；使用以下的第二句可以在 `source` 下新建以 `<page-title>` 为名称的文件夹，文件夹内的 `index.md` 可以在编译后生成一个新的页面。

```sh
hexo new "<post-title>"  #新建文章
hexo new page "<page-title>"  #新建页面
```

因为原始的都是 Markdown 文件，要让浏览器可以显示美观的网页，需要根据 Markdown 文件生成 HTML 静态文件。执行以下命令：

```sh
#生成静态文件
hexo generate  #或者 hexo g
```

在某些情况，如果发现对站点的更改无论如何也不生效，可能需要运行该命令，清除缓存文件 `db.json` 和已生成的静态文件 `/public/`。

```sh
hexo clean
```

### 2.3 本地预览调试与部署网站
要在本地预览调试生成的博客网页效果，可以执行以下命令。访问网址为：`http://localhost:4000/`。

```sh
hexo serve
```

如果是部署在 GitHub Pages，可以按照下述命令配置站点配置文件（注意缩进保持一致）：

```yaml /_config.yml
# Deployment
deploy:
  - type: git
    repo: https://github.com/<github-username>/<github-repo-name>.git
    branch: <github-repo-branch>
```

设置完成后，执行以下命令。第一次执行过程中会提示输入相应用户名和密码，正确输入后既可以正常部署。

```sh
#首次部署要先执行以下命令安装插件
yarn add hexo-deployer-git #或者 npm i hexo-deployer-git --save
#部署网站
hexo deploy
```

在两条命令直接采用 `&&` 进行连接即可同时执行两条命令。另外，使用以下的命令可以简化命令的使用：

```sh
hexo s -g  #启动服务器之前预先生成静态文件，等价于 hexo g && hexo s
hexo g -d  #静态文件生成后立即部署网站，等价于 hexo g && hexo d
```

### 2.4 添加文章命令后自动打开编辑器
参考：[Hexo添加文章时自动打开编辑器 - Doublemine](https://notes.wanghao.work/2015-06-29-Hexo添加文章时自动打开编辑器.html)

在**站点**文件夹根目录新建文件夹 `scripts`，然后在文件夹内新建文件 `openeditor.js`：

```javascript /scripts/openeditor.js
//Windows
var spawn = require('child_process').exec;
hexo.on('new', function(data){
	spawn('start  "markdown编辑器绝对路径.exe" ' + data.path);
});

//macOS
var exec = require('child_process').exec;
hexo.on('new', function(data){
	exec('open -a "markdown编辑器绝对路径.app" ' + data.path);
});
```

## 3. 博客主题自定义
### 3.1 修改主题
可以执行以下命令下载主题文件，当然也可以从 GitHub [直接下载](https://github.com/theme-next/hexo-theme-next/releases) 最新版本压缩包，解压后将文件放在 `/themes/next` 目录下面。

```sh
cd <blog-path>  #定位到 Hexo 博客目录
git clone https://github.com/theme-next/hexo-theme-next /themes/next
```

另一种是通过添加子模块的方法载入主题文件：

```sh
git submodule add https://github.com/theme-next/hexo-theme-next themes/next
```

下载主题文件后，打开博客根目录下的站点配置文件（`/_config.yml`），找到 `theme` 键值，将值修改为 `next` 即可。

{% note warning %}
**注意**：图片图标文件可以放到 `/themes/next/source/images/`（默认图标放在这里）或者 `/source/` 目录下。如果图标文件放至在 `/themes/next/source/images/` 目录下，务必注意不要和目录下的默认图标文件名一样，否则在生成静态文件的时候会被默认文件会覆盖。
{% endnote %}

### 3.2 站点地图
要自动生成站点地图，可以执行以下命令，这样以后每次执行 `hexo g`，都会生成 `sitemap.xml`。

```sh
cd <blog-path>
yarn add hexo-generator-sitemap #或者 npm i hexo-generator-sitemap --save
```

### 3.3 与主题样式一致的404页面
要生成一个和主题样式一致的404页面，首先需要新建一个页面：

```sh
cd <blog-path>
hexo new page "404"
```
编辑该页面的 Markdown 文件为以下内容，正文部分可以自行编辑内容。其中 `permalink: /404` 表示将该文件解析生成的 HTML 文件永久链接设置为 `/404`，这样就可以让访客访问错误链接时看到这个页面了。

```markdown
---
title: 404 Not Found
comments: false
permalink: /404
---
```

### 3.4 修改文章永久性链接
这里使用插件 `hexo-abbrlink` 来生成博客文章的永久链接，可以查看该插件的 [GitHub 项目页面](https://github.com/Rozbo/hexo-abbrlink)。

```sh
cd <blog-path>
yarn add hexo-abbrlink #或者 npm i hexo-abbrlink --save
```

在站点配置文件中修改 `permalink`：

```diff /_config.yml
-permalink: :year/:month/:day/:title/
+permalink: posts/:abbrlink/
+abbrlink:
+  alg: crc32  #support crc16(default) and crc32
+  rep: hex    #support dec(default) and hex
```

### 3.5 文章置顶
首先替换给文章排序索引的原有插件 `hexo-generator-index`，执行以下命令

```sh
yarn remove hexo-generator-index && yarn add hexo-generator-indexed

#或者以下命令
npm uni hexo-generator-index --save && npm i hexo-generator-indexed --save
```

然后在需要置顶的文章的开头添加 `sticky` 控制文章置顶：

```diff
---
+sticky: true
---
```

### 3.6 豆瓣读书电影游戏展示
如果想在博客中展示自己在豆瓣上的读书、电影、游戏等的信息，可以安装插件 [`hexo-douban`](https://github.com/mythsman/hexo-douban)。而要增加知乎、豆瓣图标支持，请阅读《 [Hexo NexT 博客增加知乎豆瓣图标支持](/posts/89dad1c1/)》。

但是，该插件在 Safari 浏览器下无法显示豆瓣读书中书籍封面图片。需要做的修改就是让页面自动判断是不是豆瓣读书页面，如果是就加载一句 meta 信息，否则就不加载。所以，把以下这段代码加入到 `/source/_data/head.swig` 之中：

```javascript /source/_data/head.swig
<script>
  function GetUrlRelativePath() {
    var url = document.location.toString(); //获取当前链接
    var arrUrl = url.split("//");
    var start = arrUrl[1].indexOf("/");
    var relUrl = arrUrl[1].substring(start); //截取从start开始到结尾的所有字符
    if(relUrl.indexOf("?") != -1){
      relUrl = relUrl.split("?")[0];
    }
      return relUrl;
  }
  var relUrl = GetUrlRelativePath()
  if (relUrl.indexOf('/books/')>=0) {  //判断是否为豆瓣读书页面
    document.write('<meta name="referrer" content="never" />');
  }
</script>
```

因为这里利用到了主题注入功能，所以需要在**主题配置文件**启用该功能：

```diff /themes/next/_config.yml
 custom_file_path:
-  #head: source/_data/head.swig
+  head: source/_data/head.swig
```

### 3.7 Travis CI 持续集成

具体方法可以查看 [Hexo遇上Travis-CI：可能是最通俗易懂的自动发布博客图文教程](https://juejin.im/post/5a1fa30c6fb9a045263b5d2a)。需要提醒的是目前 Travis CI 已经计划逐渐把 [travis-ci.org](https://travis-ci.org) 的项目迁移到 [travis-ci.com](https://travis-ci.com) ，所以只需要用后者即可。这样就可以让 Travis CI 监视 GitHub 上博客源文件分支的变动，自动生成博客静态网页文件并部署到 GitHub Pages。

### 3.8 相册
关于创建瀑布流的相册，请查看《[Hexo NexT 博客增加瀑布流相册页面](/posts/3720dafc/)》。

文章图片的存储如果放至在博客项目下，会极大地增加项目的空间。所以可以将图片上传到图床，然后在需要图片的地方引用该图片外部链接即可。我现在选择了腾讯云的 COS 对象存储，提供每个月 10GB 的免费外网下行流量，以及每个月 50GB 的免费存储空间。

另外介绍一个 macOS 上十分实用的批量打水印免费软件 [XnConvert](http://www.xnview.com/en/xnconvert/)，可以查阅这一份 [使用说明](https://ningselect.com/2017/02/25/攝影小教室-超簡單！一招幫所/)。
