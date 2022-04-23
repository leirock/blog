'use strict';

// 自定义布局，将需替换或添加的布局文件放到根目录layout下，如果主题layout文件夹中有同名文件则会覆盖
// 参考 https://github.com/next-theme/hexo-theme-next/discussions/209
// const { readFileSync } = require('fs');
// hexo.extend.filter.register('before_generate', () => {
//     const file = readFileSync('layout/page.njk').toString();
//     hexo.theme.setView('page.njk', file);
// }) 

//友链列表
hexo.extend.tag.register('linklist', function(args) {
  return `<div name="linklist" class="favlink-grid" src="${args}"></div>`;
});

//相册
hexo.extend.tag.register('album', function(args) {
  return `<style>.post-block{padding-left:10px;padding-right:10px;}</style>
  <div class="album" src-json="${args[0]}" src-photo="${args[1]}"></div>`;
});

//相册列表
// 可以用 {% albumbox https://web-1256060851.cos.ap-hongkong.myqcloud.com %} 来重新定义变量 cdnDomain
hexo.extend.tag.register('albumbox', function([args, delimiter = '|', comment = '%'], content) {
  const links = content.split('\n').filter(line => line.trim() !== '').map(line => {
    const item = line.split(delimiter).map(arg => arg.trim());
    const cdnDomain =  args || 'https://web-1256060851.file.myqcloud.com';
    if (item[0][0] === comment) return '';
    const imagePath = item[2];
    const imageSource = cdnDomain + imagePath;
    return `
      <div class="albumbox-photo">
        <a href="${item[1]}">
          <img alt="${item[0]}" src="${imageSource}!500x">
          <p class="image-caption">${item[0]}</p>
        </a>
      </div>`;
  });
  return `<div class="albumbox">${links.join('')}</div>`;
}, true);
