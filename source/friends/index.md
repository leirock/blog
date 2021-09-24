---
title: 友情链接
description: 班班的朋友们
comments: false
---

<div id="friends" class="link-grid mygrid"></div>

* * *

## 1. 收录规则

- 以「友情推荐、方便自己访问」为宗旨收录链接，原则上优先考虑熟悉的朋友；
- 主题不限，但是应当有{%dot 实质性原创内容 %}并让我产生共鸣，或者设计排版有独特风格；
- 定期清理友链，范围包括但不限于长期未更新、无法访问、已不再符合上述的收录标准等。

## 2. 交换友链方式

### 2.1 添加本站友链

{% note success %}
#### 本站信息
名称：纯粹
简介：班班的碎碎念
标识：https://cdn.jsdelivr.net/gh/leirock/assets/avatar/avatar-512.png
链接：https://blog.dlzhang.com
{% endnote %}

### 2.2 优化标识图片

为了提高图片加载速度，建议优化标识图片：

- 打开 [压缩图](https://www.yasuotu.com) 上传自己的头像，将图片尺寸调整到 96px 后下载;
- 将压缩后的图片上传到 [去不图床](https://7bu.top) 并使用此图片链接作为站点标识。

### 2.3 提交申请

- Fork [<i class="fab fa-fw fa-github"></i>友链代码仓库](https://github.com/leirock/friends)；
- 按照如下格式将网站信息添加到 `friendslists.yml` 文件的末尾：
```yaml
- title: 站点名称 #填写站点名称
  descriprion: 站点简介 #填写站点简介
  logo: https://bu.dusays.com/2021/09/24/c9764a44cf8b7.png #标识图片链接
  url: https://example.com #填写站点链接
```
- 完成后，请新建一个 Pull Request，被批准合并后就会显示在本页。

{% note info %}
#### 提示
如果无法使用 GitHub，可以在[留言板](/guestbook/)留下上述信息。
{% endnote %}