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
