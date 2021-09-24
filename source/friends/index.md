---
title: 友情链接
description: 班班的朋友们
comments: false
toc:
  enable: false
---

{% friendslink https://api.dlzhang.com/proxy/?url=https://raw.githubusercontent.com/leirock/friends/main/generator/output/data.json %}

* * *

## 收录规则

- 以「友情推荐、方便自己访问」为宗旨收录链接，优先考虑熟悉的朋友；
- 主题不限，但是应当有{%dot 实质性原创内容 %}并让我产生共鸣，或者设计排版有独特风格；
- 定期清理友链，范围包括但不限于长期未更新、无法访问、已不再符合上述的收录标准等。

## 交换友链方式

**第一步：提交 Issue 并等待审核**

新建 [GitHub Issue](https://github.com/leirock/friends/issues/)，按模板格式填写并提交。待审核通过，添加 `active` 标签后，回来刷新即可生效。

```json
{
    "title": "站点名称",
    "description": "站点简介",
    "logo": "标识图片建议提供jsDelivr或者去不图床的链接",
    "url": "站点链接"
}
```

关于优化标识图片的建议：

- 打开 [压缩图](https://www.yasuotu.com) 上传站点标识图片，将图片尺寸调整到 96px 后下载;
- 将压缩后的图片上传到 [去不图床](https://7bu.top) 并使用此图片链接作为站点标识。

{% note info %}
#### 提示
如果无法使用 GitHub，可以在[留言板](/guestbook/)留下上述信息。
{% endnote %}

**第二步：添加本站友链**

请添加本站到您的友链中，如果您也使用 Issues 作为友链源，只需要告知您的友链源仓库即可。

{% note success %}
#### 本站信息
名称：纯粹
简介：班班的碎碎念
标识：https://cdn.jsdelivr.net/gh/leirock/assets/avatar/avatar-512.png
链接：https://blog.dlzhang.com
{% endnote %}

**第三步：更新友链信息**

- 直接修改关于对应 Issue 中的相关信息即可，大约 3 分钟内生效，无需等待博客更新；
- 如果没有相关 Issue 的编辑权，可以重新建一个 Issue，并在最后告知需要删除的旧 Issue。
