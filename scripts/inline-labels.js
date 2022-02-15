'use strict';

//着重号
hexo.extend.tag.register('dot', function(args) {
  return `<em class="emphasis-point">${args.join(' ')}</em>`;
});

//友链列表
hexo.extend.tag.register('friendslink', function(args) {
  return `<div id="friendslink" class="link-grid mygrid" link="${args}"></div>`;
});

//首行空两格
hexo.extend.tag.register('indent', function(args) {
  return `
<style>
  .post .post-body p {
    text-indent: 2em;
    margin-bottom: 0;
  }
  .post .post-body .image-caption,
  .post .post-body blockquote p {
    text-indent: 0;
    margin-bottom: 1em;
  }
  .post .post-body .note p {
    text-indent: 0;
  }
</style>
`;
});