'use strict';

hexo.extend.tag.register('dot', function(args) {
  return `<em class="emphasis-point">${args.join(' ')}</em>`;
});

hexo.extend.tag.register('friendslink', function(args) {
  return `<div id="friendslink" class="link-grid mygrid" list="${args}"></div>`;
});