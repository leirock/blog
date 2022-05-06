'use strict';

// 自定义布局，将需替换或添加的布局文件放到根目录layout下，如果主题layout文件夹中有同名文件则会覆盖
// 参考 https://github.com/next-theme/hexo-theme-next/discussions/209
// const { readFileSync } = require('fs');
// hexo.extend.filter.register('before_generate', () => {
//     const file = readFileSync('layout/page.njk').toString();
//     hexo.theme.setView('page.njk', file);
// })

// 初始化对象存储域名cosDomain
console.log('\n-------------------------------------------------\n \
COS Domain is: ' + hexo.config.cos_domain + '（腾讯云）\
\n-------------------------------------------------\n')

const cosDomain = hexo.config.cos_domain;
// preconnect
hexo.extend.injector.register('head_begin', () => {
  return '<link rel="preconnect" href="'+ cosDomain +'" crossorigin="">';
});

// 着重号
hexo.extend.tag.register('dot', function(args) {
  return `<em class="emphasis-point">${args.join(' ')}</em>`;
});

// 友链列表
hexo.extend.tag.register('linklist', function(args) {
  return `<div class="link-list" src="${args}.json"></div>`;
});

// 文艺清单
hexo.extend.tag.register('culturelist', function(args) {
  const coverSrc = cosDomain + '/' + hexo.config.custom_page_path.culture + '/' + args + '/';
  const jsonSrc = args + '-list.json';
  return `<div class="culture-list" cover-src="${coverSrc}" json-src="${jsonSrc}"></div>`;
});

// 相册
// 如果输入是两个值，那么用 args[0]，args[1] 分别代表
hexo.extend.tag.register('album', function(args) {
  const photoSrc = cosDomain + '/' + hexo.config.custom_page_path.album + '/' + args + '/';
  const jsonSrc = photoSrc + args + '-list.json';
  return `<style>.post-block{padding-left:10px;padding-right:10px;}</style>
  <div class="album" photo-src="${photoSrc}" json-src="${jsonSrc}"></div>`;
});

// 子页面列表
hexo.extend.tag.register('subpagebox', function([args, delimiter = '|', comment = '%'], content) {
  const links = content.split('\n').filter(line => line.trim() !== '').map(line => {
    const item = line.split(delimiter).map(arg => arg.trim());
    const imageSource = cosDomain + '/' + args + '/' + item[1] + '/' + item[2];
    if (item[0][0] === comment) return '';
    return `
      <div class="subpage-box-cover">
        <a href="${item[1]}/">
          <img alt="${item[0]}" src="${imageSource}">
          <p class="image-caption">${item[0]}</p>
        </a>
      </div>`;
  });
  return `<div class="subpage-box">${links.join('')}</div>`;
}, true);