---
title: 交换友链指南
---

## 1. 友链收录规则

- 以「友情推荐、方便自己访问」为宗旨收录链接，原则上优先考虑熟悉的朋友；
- 网站有实质性原创内容并让我产生共鸣，或者网站设计排版有独特风格；
- 内容主题不限，但是应当不违背社会公序良俗和相关法律法规；
- 会定期清理友链，清理范围包括但不限于长期内容未更新、无法访问、网站已不再符合上述的收录标准等。

## 2. 如何交换友链
### 2.1 添加本站友链

{% note success %}
名称：`醉里挑灯赏猫` 或 `班班碎碎念`，二选一
简介：`靡革匪因 靡故匪新`
链接：`https://blog.dlzhang.com`
标识：https://sdn.geekzu.org/avatar/cc763511474fe24ffcc80257fb7cb970?size=512
{% endnote %}

### 2.2 准备站点相关信息

请准备好您站点的<u>名称</u>、<u>简介</u>、<u>标识图片</u>和<u>链接</u>，其中对于标识图片有以下要求：

- 中心对称图形，如正方形、圆形、菱形等；
- 长度与宽度应小于 `512px`，文件大小应小于 1 MiB；
- 使用常见图形文件格式（如 `png`、`jpg`、`svg`、`ico` 等，不包括 `tiff`、`webp`、`icns`）;
- 文件名格式为 `[domain].[format]`，如 `example.com.png`，`blog.example.com.jpg`。

### 2.3 提交申请

- Fork [<i class="fab fa-fw fa-github"></i>友链代码仓库](https://github.com/leirock/friends)；
- 在仓库 `src/logo` 文件夹下添加标识图片；
- 按照如下格式将网站信息添加到仓库 `src/friendslists.yml` 文件的末尾：
```yaml
- title: 站点名称 #您的站点名称
  descriprion: 站点介绍 #您的站点简介
  logo: example.com.png #标识图片的文件名
  url: https://example.com #您的站点链接
```
- 完成后，请新建一个 Pull Request，被批准合并后就会显示在[友链页面](/friends)。

{% note info %}
如果无法使用 GitHub，可以在下方评论区留下您站点的相关信息。
{% endnote %}