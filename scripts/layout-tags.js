'use strict';

// 自定义布局，将需替换或添加的布局文件放到根目录layout下，如果主题layout文件夹中有同名文件则会覆盖
// 参考 https://github.com/next-theme/hexo-theme-next/discussions/209
// const { readFileSync } = require('fs');
// hexo.extend.filter.register('before_generate', () => {
//     const file = readFileSync('layout/page.njk').toString();
//     hexo.theme.setView('page.njk', file);
// }) 

//着重号
hexo.extend.tag.register('dot', function(args) {
  return `<em class="emphasis-point">${args.join(' ')}</em>`;
});

//友链列表
hexo.extend.tag.register('linklist', function(args) {
  return `<div class="link-list" src="${args}"></div>`;
});

//相册
//如果输入是两个值，那么用 args[0]，args[1] 分别代表
hexo.extend.tag.register('album', function(args) {
  const cosDomain = 'https://cos.pinlyu.com';
  const photoSrc = cosDomain + '/album/' + args + '/';
  const jsonSrc = photoSrc + 'photolist.json';
  return `<style>.post-block{padding-left:10px;padding-right:10px;}</style>
  <div class="album" photo-src="${photoSrc}" json-src="${jsonSrc}"></div>`;
});

//子页面列表
hexo.extend.tag.register('subpagebox', function([args, delimiter = '|', comment = '%'], content) {
  const links = content.split('\n').filter(line => line.trim() !== '').map(line => {
    const item = line.split(delimiter).map(arg => arg.trim());
    // const cosDomain = args || 'https://cos.pinlyu.com';
    const cosDomain = 'https://cos.pinlyu.com';
    const imageSource = cosDomain + '/' + args + '/' + item[1] + '/' + item[2];
    if (item[0][0] === comment) return '';
    return `
      <div class="subpage-box-cover">
        <a href="${item[1]}/">
          <img alt="${item[0]}" src="${imageSource}!500x">
          <p class="image-caption">${item[0]}</p>
        </a>
      </div>`;
  });
  return `<div class="subpage-box">${links.join('')}</div>`;
}, true);