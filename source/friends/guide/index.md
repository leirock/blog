---
title: 交换友链指南
---

## 1. 基本要求

- 优先考虑添加班班眼熟认识的朋友；
- 有 **实质性原创内容** 的网站，对于充斥抄袭、洗稿等内容等网站不予收录；
- 网站内容主题不限，但是应当不违背社会公序良俗和相关法律法规。

## 2. 如何交换友链
### 2.1 添加本站友链

{% note success %}
名称：`醉里挑灯赏猫` 或 `班班碎碎念`，二选一
简介：`靡革匪因 靡故匪新`
链接：`https://blog.dlzhang.com`
标识：https://sdn.geekzu.org/avatar/cc763511474fe24ffcc80257fb7cb970?size=512
{% endnote %}

### 2.2 准备站点相关信息
#### 标识图片
  - 中心对称图形，如正方形、圆形、菱形等；
  - 长度与宽度应小于 `512px`，文件大小应小于 1 MiB；
  - 使用常见图形文件格式（如 `png`、`jpg`、`svg`、`ico` 等，不包括 `tiff`、`webp`、`icns`）。

#### 站点名称
  - 长度应小于 16 个半角字符或 8 个全角字符，否则在展示时可能会被截断

### 2.3 提交申请
- Fork [<i class="fab fa-fw fa-github"></i>友链代码仓库](https://github.com/leirock/friends)；
- 在仓库 `src/logo` 文件夹下添加标识图片；
  - 文件名格式为 `[domain].[format]`，如 `example.com.png`，`blog.example.com.jpg`
- 按照如下格式将网站信息添加到仓库 `src/friendslists.yml` 文件的末尾：
    ```yaml
    - name: 站点名称 # 你的站点名称
      logo: example.com.png #标识图片的文件名
      url: https://example.com # 你的网站链接
    ```
- 完成后，请新建一个 Pull Request，通过后将会尽快显示在[友链页面](/friends)。

{% note info %}
如果无法使用 GitHub，可以在评论区留下上述信息。
{% endnote %}