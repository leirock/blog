---
title: Hexo NexT 博客增加知乎豆瓣图标支持
categories: [随手记]
tags: [blog, CSS, 技术]
date: 2018-06-13 04:21:54
---

因为 Hexo NexT 原始主题是采用了 Font Awesome 图标，并未包含如知乎、豆瓣这类中国大陆的社交网站图标。所以需要加入另一种图标的支持，使得博客可以显示出知乎、豆瓣这类的图标。<!-- more -->

- 感谢评论区 jqgsninimo 提供的[改进](/posts/89dad1c1/#5c23395f1579a3005f18ede7)，方法更佳简单明了，本文已经更新该方法。 
- CSS 自定义文件指 `/source/_data/styles.styl`
- 本文适用于 Hexo 4.2.0 / NexT 7.7.1

## 1. 下载图标
首先，前往 [阿里巴巴矢量库](http://www.iconfont.cn/) 挑选需要的图标，在图标上点击 <i class="fas fa-shopping-cart"></i> 加入购物车。

![阿里巴巴矢量库](https://web-1256060851.file.myqcloud.com/images/2018/Hexo-NexT-博客增加知乎豆瓣图标支持/iconfont.png!500x)

然后，点击页面右上方 <i class="fas fa-shopping-cart"></i> 进入购物车，选择「下载代码」。

![购物车下载代码](https://web-1256060851.file.myqcloud.com/images/2018/Hexo-NexT-博客增加知乎豆瓣图标支持/download.png!300x)

将下载的文件解压后，找到 `iconfont.css` 文件，打开后将其中的所有内容都复制加入到主题 CSS 自定义文件中的任意位置。这里需要修改部分内容，使得图标样式可以和主题样式保持一致。在这样设置好以后，就可以在博客需要额外图标的地方使用 `<i class="iconfont icon-xxx"></i>` 的进行引用了。

但是这里有一个问题，如果想在侧边栏的社交网站列表里加入知乎、豆瓣这类图标，就不是这样引用了。因为主题配置文件中，对侧边栏的社交网站图标的引用省略了 `class` 的部分内容，将其加入到了 `layout` 的模版里，所以现在不能直接填写 `zhihu` 或者 `icon-zhihu` 到主题配置文件中，所以我们需要重新设置一下自定义样式。

## 2. 自定义样式配置
因为阿里巴巴矢量库里有多个知乎、豆瓣的图标，大小不一，即使设置了字体大小页可能无法和原始图像大小一致，这让强迫症的我不能忍，经过仔细挑选我终于找到了合适大小的两个图标。在主题 CSS 自定义文件中可以直接加入以下内容：

```css /source/_data/styles.styl
//知乎豆瓣图标 font-class引用
@font-face {font-family: "iconfont";
  src: url('iconfont.eot?t=1528847148903'); /* IE9*/
  src: url('iconfont.eot?t=1528847148903#iefix') format('embedded-opentype'), /* IE6-IE8 */
  url('data:application/x-font-woff;charset=utf-8;base64,d09GRgABAAAAAAYUAAsAAAAACIgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADMAAABCsP6z7U9TLzIAAAE8AAAARAAAAFZW7kimY21hcAAAAYAAAABmAAABnM+nbGdnbHlmAAAB6AAAAigAAAJIGJn6FGhlYWQAAAQQAAAALwAAADYRrDxZaGhlYQAABEAAAAAcAAAAJAfeA4VobXR4AAAEXAAAABAAAAAQD+kAAGxvY2EAAARsAAAACgAAAAoBmgDsbWF4cAAABHgAAAAfAAAAIAETAF1uYW1lAAAEmAAAAUUAAAJtPlT+fXBvc3QAAAXgAAAAMQAAAEIxfhjKeJxjYGRgYOBikGPQYWB0cfMJYeBgYGGAAJAMY05meiJQDMoDyrGAaQ4gZoOIAgCKIwNPAHicY2Bk/sU4gYGVgYOpk+kMAwNDP4RmfM1gxMjBwMDEwMrMgBUEpLmmMDgwVDzbxdzwv4EhhrmBoQEozAiSAwAx0A0oeJzFkNEJwCAMRC/GFikdpZ+lOE+/OoKzOVDWsEn0xwk8eTE5DiIC2ACwcikRoA8E06suuc843I94dE56gt5FstTWps5EnkjesSVpxzLRutWzTq/3mOy/y0CfKLljvtQOwg+NwxM7AAB4nB3PzWvTcBjA8d/z+zVJX5MmaV6aNk2T2KZbu9Y1bWqna1mVwqas9QVlB6F1Igi+4GkwBu6gIOhh1wq+IMIEbx487aCC4MF/wKO6g568emk03cP38PBcHj6IQujfd3JAVCSiElpEZ9AQIaDLYLFYB9NpVHEZJJOSlBRLHNsxGduqkmVQLDol171GUaEZmgMWcuCadc+pYgeajQ4+CXVZB0hntItCISuQPYiqTu6hv4ZfgWTYWa6z4K9Wuql6XgxvxQUhLQhPwjRFhTEOcSzcVuQIFYnS/muK06QDYw4bEE872rmNRD4jjB817ugFJQKwuwtiJs/ud3mND9rRZFFIM8lEWNUS9rEUbB3GVDGuF3+iYEhg/Uw+kC46hU6jtcDpVqEMXhfcRtExO9AqHmForxXsriIzNguSywITRMuzY5DSgRowXkvkXaXl8sRmHJt3YfQRC3if4NALOuH/ApmnLqQVVcfZWLzNXcEY3oncV0bm5M5lgucXzueSucQbzMZ25gXqd1/ffro63FTTh7BuFVZWxtQSFdqwQsbw0uJSJESRcnt7PZNs4spVo3KtDzGCS+382dIn3K08Nroe3J9uDof42fRtr4ejM2voCLxHZmoRKUhHSDQlE7yW4/Im7zKyYktmE5qmBIGdZh7gv9Mwtmrl5XvTl7eWj1f+kPx0Au/9b7U2XC/1CBpMn/dHc3DC/1LqjwcDyE0m/o+7oxs3g0//AcOlaXN4nGNgZGBgAGI3hpVx8fw2Xxm4WRhA4LpbjQ6C/n+UhYHZHsjlYGACiQIA9CsInAB4nGNgZGBgbvjfwBDDwgACQJKRARWwAABHCgJtBAAAAAPpAAAEAAAABAAAAAAAAAAAdgDsASQAAHicY2BkYGBgYQhkYGUAASYg5gJCBob/YD4DABESAXEAeJxlj01OwzAQhV/6B6QSqqhgh+QFYgEo/RGrblhUavdddN+mTpsqiSPHrdQDcB6OwAk4AtyAO/BIJ5s2lsffvHljTwDc4Acejt8t95E9XDI7cg0XuBeuU38QbpBfhJto41W4Rf1N2MczpsJtdGF5g9e4YvaEd2EPHXwI13CNT+E69S/hBvlbuIk7/Aq30PHqwj7mXle4jUcv9sdWL5xeqeVBxaHJIpM5v4KZXu+Sha3S6pxrW8QmU4OgX0lTnWlb3VPs10PnIhVZk6oJqzpJjMqt2erQBRvn8lGvF4kehCblWGP+tsYCjnEFhSUOjDFCGGSIyujoO1Vm9K+xQ8Jee1Y9zed0WxTU/3OFAQL0z1xTurLSeTpPgT1fG1J1dCtuy56UNJFezUkSskJe1rZUQuoBNmVXjhF6XNGJPyhnSP8ACVpuyAAAAHicY2BigAAuBuyAhZGJkZmRhZGVgbGCtSojM6OUpzgjsShVNyW/NCkxj4EBAF/8B44AAAA=') format('woff'),
  url('iconfont.ttf?t=1528847148903') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
  url('iconfont.svg?t=1528847148903#iconfont') format('svg'); /* iOS 4.1- */
}
//以上是下载来自阿里巴巴矢量库的图标数据
//以下代码相对下载下来的代码做了部分修改
.fa-custom {
  font-family:"iconfont" !important;
  font-size:inherit;
  font-style:normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.zhihu:before { content: "\e6ba"; }
.douban:before { content: "\e638"; }
```

因为这里利用到了主题注入功能，所以需要在**主题配置文件**启用该功能：

```diff /themes/next/_config.yml
 custom_file_path:
-  #style: source/_data/styles.styl
+  style: source/_data/styles.styl
```

## 3. 图标的应用

举个例子，在主题配置文件中，社交账号图标设置好以后，类似是以下这样的格式：

```yaml /themes/next/_config.yml
social:
  Twitter: https://twitter.com/user_id || twitter
  GitHub: https://github.com/user_id || github
  Zhihu: https://www.zhihu.com/people/user_id || custom zhihu
  Douban: https://www.douban.com/people/user_id/ || custom douban
```