---
title: Hexo NexT 博客增加瀑布流相册页面
categories: [笔记]
tags: [设计, blog]
pid: 31
cc_license: true
date: 2018-06-11 12:24:01
updated: 2021-05-14 23:30:00
---

因为 Hexo NexT 博客没有提供相册页面模板，这里介绍一种添加瀑布流相册页面的方法。注意，本文适用于 Hexo 5.4.0 / NexT 8.3.0，其他版本的兼容性未知。
<!--more-->

## 1. json 文件处理图片信息

在博客根目录的 `/scripts/` 文件夹下新建一个 `phototool.js` 文件，内容如下。主要功能是访问照片文件夹，获取每张照片的大小和文件名，并生成对应的 `json` 文件：

```javascript
"use strict";
const fs = require("fs");
const sizeOf = require('image-size');
//本地照片所在目录
const path = "source/photos/images"; 
//要放置生成的照片信息文件目录，建议直接放在 source/photos/ 文件夹下
const output = "source/photos/photoslist.json";
var dimensions;
fs.readdir(path, function (err, files) {
    if (err) {
        return;
    }
    let arr = [];
    (function iterator(index) {
        if (index == files.length) {
            fs.writeFileSync(output, JSON.stringify(arr, null, "\t"));
            return;
        }
        fs.stat(path + "/" + files[index], function (err, stats) {
            if (err) {
                return;
            }
            if (stats.isFile()) {
                dimensions = sizeOf(path + "/" + files[index]);
                console.log(dimensions.width, dimensions.height);
                arr.push(dimensions.width + '.' + dimensions.height + ' ' + files[index]);
            }
            iterator(index + 1);
        })
    }(0));
});
```

创建好并把照片放在目录后，执行以下命令：

```bash
# 定位到 Hexo 博客目录
cd <folder-path>

# 安装依赖包
npm i image-size

# 生成对应的 json 文件
node scripts/phototool.js  
```

`node scripts/phototool.js` 这个步骤以后可以不用手动执行，每次 `hexo s` 或者 `hexo deploy` 时候会被自动执行。如果报错，请注意检查保存本地照片的文件夹里有没有非图片类文件，特别是要删除如 `.DS_Store` 这样的隐藏文件。`json` 文件样例如下：

```json
[
	"4032.3024 IMG_0391.webp",
	"12500.3874 IMG_0404.webp",
	"4032.3024 IMG_0416.webp",
	"4032.3024 IMG_0424.webp",
]
```

## 2. 加载 js 文件

首先，在 `/source/js/` 目录下创建 `photo.js`：

```javascript
var imgDataPath = '/photos/photoslist.json'; //图片名称高宽信息json文件路径
var imgPath = '/images/photos/';  //图片访问路径
var imgMaxNum = 50; //图片显示数量

var windowWidth = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;
if (windowWidth < 768) {
    var imageWidth = 145; //图片显示宽度(手机端)
} else {
    var imageWidth = 215; //图片显示宽度
}

photo = {
    page: 1,
    offset: imgMaxNum,
    init: function () {
        var that = this;
        $.getJSON(imgDataPath, function (data) {
            that.render(that.page, data);
            //that.scroll(data);
        });
    },
    render: function (page, data) {
        var begin = (page - 1) * this.offset;
        var end = page * this.offset;
        if (begin >= data.length) return;
        var html, imgNameWithPattern, imgName, imageSize, imageX, imageY, li = "";
        for (var i = begin; i < end && i < data.length; i++) {
           imgNameWithPattern = data[i].split(' ')[1];
           imgName = imgNameWithPattern.split('.')[0]
           imageSize = data[i].split(' ')[0];
           imageX = imageSize.split('.')[0];
           imageY = imageSize.split('.')[1];
            li += '<div class="card" style="width:' + imageWidth + 'px" >' +
                    '<div class="ImageInCard" style="height:'+ imageWidth * imageY / imageX + 'px">' +
                      '<a data-fancybox="gallery" href="' + imgPath + imgNameWithPattern + '" data-caption="' + imgName + '" title="' +  imgName + '">' +
                        '<img data-src="' + imgPath + imgNameWithPattern + ' " src="' + imgPath + imgNameWithPattern + ' " data-loaded="true">' +
                      '</a>' +
                    '</div>' +
                  '</div>'
        }
        $(".ImageGrid").append(li);
        this.minigrid();
    },
    minigrid: function() {
        var grid = new Minigrid({
            container: '.ImageGrid',
            item: '.card',
            gutter: 12
        });
        grid.mount();
        $(window).resize(function() {
           grid.mount();
        });
    }
}
photo.init();
```

然后，在 `/source/_data/` 下创建 `body-end.swig` 文件，并添加如下代码：

```swig
{% if page.type ==='picture' %}
  <script src="//cdn.jsdelivr.net/npm/minigrid@3.1.1/dist/minigrid.min.js"></script>
  <script src="/js/photo.js"></script>
{% endif %}
```

因为这里利用到了主题注入功能，所以需要在**主题配置文件**启用该功能：

```diff
 custom_file_path:
-  #bodyEnd: source/_data/body-end.swig
+  bodyEnd: source/_data/body-end.swig
```

## 3. 编辑相册页面

新建相册页 ` hexo new page photos`，创建  `/source/photos/index.md`，编辑为以下内容：

```markdown
---
title: 相册
type: picture
comments: true
---

<style>
.ImageGrid {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  text-align: center;
}
.card {
  overflow: hidden;
  transition: .3s ease-in-out;
  border-radius: 8px;
  background-color: #efefef;
  padding: 1.4px;
}
.ImageInCard img {
  padding: 0;
  border-radius: 8px;
}
@media (prefers-color-scheme: dark) {
  .card {background-color: #333;}
}
</style>

<div class="ImageGrid"></div>

```

## 4. 主题配置文件设置

在主题配置文件中，按照说明安装和开启 `fancybox` 。在 `menu` 添加如下内容可以添加相册页导航菜单：

```diff
 menu:
+  photos: /photos/ || fas fa-camera-retro
```