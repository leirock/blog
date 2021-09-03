'use strict';

hexo.extend.tag.register('dot', function(args) {
  return `<em class="emphasis-point">${args.join(' ')}</em>`;
});