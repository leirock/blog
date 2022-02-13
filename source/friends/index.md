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

- 优先考虑熟悉的朋友；
- 主题不限，但应有{%dot 实质性原创内容 %}，且能让我产生共鸣，或者设计排版有独特风格；
- 定期清理友链，范围包括但不限于长期未更新、无法访问、已不再符合上述收录标准等。

{% note success %}
#### 本站信息
名称：`纯粹` 或 `班班`
简介：班班的碎碎念
标识：https://sdn.geekzu.org/avatar/cc763511474fe24ffcc80257fb7cb970?s=256
链接：https://blog.dlzhang.com
{% endnote %}

## 提交友链申请

新建 [GitHub Issue](https://github.com/leirock/friends/issues/)，按模板格式填写站点信息，提交后请等待审核通过。如果无法创建 GitHub Issue，可以在[留言板](/guestbook/)留下相关信息。

```json
{
    "title": "站点名称",
    "description": "站点简介",
    "logo": "标识图片链接",
    "url": "站点链接"
}
```

其中，对于标识图片的链接有如下建议：

- 使用 Gravatar 头像的[镜像链接](https://cdn.geekzu.org/cached.html)，链接以 `?s=96` 结尾控制图片尺寸；或者
- 通过 [压缩图](https://www.yasuotu.com) 将尺寸调整到 96px，然后上传至 [笑果图床](https://imagelol.com) 获取链接。

如果需要更新友链信息，只需要：

- 直接修改相应 Issue 中的信息即可，大约 3 分钟内生效，无需通知博主更新；
- 如果您没有相应 Issue 的编辑权限，可以参考申请友链的方法新建一个 Issue。
