---
title: 服务器部署静态博客和看板娘 Live2D API
categories: [笔记本]
tags: [服务器, 持续集成]
pid: 47
cc_license: true
date: 2020-04-15 19:45:00
edit: 2022-03-12 23:45:00
---

## 1. 服务器部署静态博客

在服务器上部署静态博客有两种方案，一是直接在服务器上用博客源代码构建网页文件并部署；二是用 GitHub 作为源代码托管，然后用 GitHub Actions 构建博客，再同步到服务器的网站根目录下。这里，我选择后一种方案。
<!--more-->

首先，在宝塔面板上创建网站。如果需要 Let's Encrypt SSL 通配符证书，可能还需要进行 DNS 解析认证，这就需要我们去域名解析提供商那边获取一个可以编辑 DNS 解析记录的 token，方便面板自动配置解析记录。然后在 GitHub Actions 脚本中添加如下内容：

```yaml
- name: Deploy to server
  uses: easingthemes/ssh-deploy@main
  env:
    ARGS: "-avz --delete"
    publish: "public/" #要同步到服务器的目录
    SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }} #服务器上公钥所对应的私钥
    REMOTE_HOST: ${{ secrets.REMOTE_HOST }} #服务器 IP 地址
    REMOTE_PORT: ${{ secrets.REMOTE_PORT }} #SSH 连接端口
    REMOTE_USER: ${{ secrets.REMOTE_USER }} #服务器 SSH 连接用户名，如 root
    TARGET: ${{ secrets.REMOTE_TARGET }} #服务器上网站的根目录
```

上述变量直接添加在代码仓库设置的 Secrets 中即可。密钥对可以在服务器控制台生成，并下载用于连接服务器的私钥（生成后重启服务器）。

最后，因为 GitHub Actions 同步到服务器网站目录过程中用到了 rsync 这一数据镜像备份工具，所以需要先在服务器上安装好 rsync：

```bash
apt install rsync
```

## 2. 将萌萌哒看板娘抱回家

![](https://web-1256060851.file.myqcloud.com/post/2020/47-live2d.png#650x)

### 2.1 看板娘前端设置

看板娘前端的设置主要可以参考 [stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget) 的介绍。

首先，从上述项目中获取以下四个文件，放入博客目录 `/source/resources/live2d/`：

- `live2d.min.js`
- `waifu-tips.json`：使用 CSS 选择器 [设置提示语](https://github.com/leirock/live2d-widget)
- `waifu-tips.js`：调整设置实现随机装扮

```diff
- if (modelId === null) {
  // 首次访问加载 指定模型 的 指定材质
  modelId = 1; // 模型 ID
- modelTexturesId = 53; // 材质 ID
+ const sample = arr => arr[Math.floor(Math.random() * arr.length)]; //随机装扮
+ modelTexturesId = sample([35,36,52,53,60]); //装扮ID
- }
```

- `waifu.css`：看板娘的样式设置，末尾可以添加如下内容

```css
/* Mobile 移动端不显示 */
@media (max-width: 768px) {
	#waifu {
		display: none;
	}
}

/* Darkmode 黑暗模式 */
@media (prefers-color-scheme: dark) {
	#waifu-tips span {
		color: greenyellow;
	}
}
```

然后，在 `/source/_data/head.njk` 添加如下内容，并设置好 `live2d_path`（前端文件路径） 和 `apiPath`（后端 API 路径）：

```javascript
<script type="text/javascript">
// 注意：live2d_path 参数应使用绝对路径
const live2d_path = "/resources/live2d/";

// 封装异步加载资源的方法
function loadExternalResource(url, type) {
	return new Promise((resolve, reject) => {
		let tag;
		if (type === "css") {
			tag = document.createElement("link");
			tag.rel = "stylesheet";
			tag.href = url;
		}
		else if (type === "js") {
			tag = document.createElement("script");
			tag.src = url;
		}
		if (tag) {
			tag.onload = () => resolve(url);
			tag.onerror = () => reject(url);
			document.head.appendChild(tag);
		}
	});
}

// 加载 waifu.css live2d.min.js waifu-tips.js
if (screen.width >= 768) {
	Promise.all([
		loadExternalResource(live2d_path + "waifu.css", "css"),
		loadExternalResource(live2d_path + "live2d.min.js", "js"),
		loadExternalResource(live2d_path + "waifu-tips.js", "js")
	]).then(() => {
		initWidget({
			waifuPath: live2d_path + "waifu-tips.json",
			apiPath: "https://api.dlzhang.com/live2d/", // https://live2d.fghrsh.net/api/
			//cdnPath: "https://cdn.jsdelivr.net/gh/fghrsh/live2d_api/"
		});
	});
}
// initWidget 第一个参数为 waifu-tips.json 的路径，第二个参数为 API 地址
// API 后端可自行搭建，参考 https://github.com/fghrsh/live2d_api
// 初始化看板娘会自动加载指定目录下的 waifu-tips.json
</script>
```

### 2.2 后端 API 搭建

首先，在宝塔面板创建新站点，设置好 PHP 版本（不是纯静态），并添加上 SSL 证书。然后，删去网站根目录 `/www/wwwroot/api/` 下默认添加创建的所有文件，确保文件夹全部清空。打开 SSH 终端，把 Live2D API 源代码拉取到网站 `live2d/` 目录：

```bash
cd /www/wwwroot/
git clone https://github.com/fghrsh/live2d_api.git api/live2d
```

最后，在网站的 Nginx 配置中允许跨域访问：

```nginx
server
{
    #add_header Access-Control-Allow-Origin * always;
    add_header 'Access-Control-Allow-Origin' $allow_origin;
}

map $http_origin $allow_origin {
    default "";
    "~^(https?://127.0.0.1(:[0-9]+)?)" $1; 
    "~^(https?://[\w]+.dlzhang.com(:[0-9]+)?)" $1;
}
```

如果前端文件通过 CDN 访问，则还需要在 CDN 中也设置好允许相关域名跨域访问的权限。