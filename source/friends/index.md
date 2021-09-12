---
title: 友情链接
description: 班班的朋友们
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
名称：{% label info@纯粹 %}（或 {% label info@风卷过的起点 %} ）
简介：{% label info@班班的碎碎念 %}
标识：https://sdn.geekzu.org/avatar/cc763511474fe24ffcc80257fb7cb970?size=512
链接：https://blog.dlzhang.com
{% endnote %}

### 2.2 准备站点相关信息

请准备好您站点的上述信息，其中对于标识图片有以下要求：

- 中心对称图形，如正方形、圆形、菱形等；
- 长度与宽度应小于 `512px`，文件大小应小于 1 MiB；
- 使用常见图形文件格式（如 `png`、`jpg`、`svg` 等）;
- 文件名格式为 `[domain].[format]`，如 `example.com.png`，`blog.example.com.jpg`。

### 2.3 提交申请

- Fork [<i class="fab fa-fw fa-github"></i>友链代码仓库](https://github.com/leirock/friends)；
- 在仓库 `src/logo` 文件夹下添加标识图片；
- 按照如下格式将网站信息添加到 `src/friendslists.yml` 文件的末尾：
```yaml
- title: 站点名称 #您的站点名称
  descriprion: 站点介绍 #您的站点简介
  logo: example.com.png #标识图片的文件名
  url: https://example.com #您的站点链接
```
- 完成后，请新建一个 Pull Request，被批准合并后就会显示在[友链页面](/friends/)。

{% note info %}
如果无法使用 GitHub，可以在下方评论区留下您站点的相关信息。
{% endnote %}