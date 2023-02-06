'use strict';

// 自定义布局，将需替换或添加的布局文件放到根目录layout下，如果主题layout文件夹中有同名文件则会覆盖
// 参考 https://github.com/next-theme/hexo-theme-next/discussions/209
// const { readFileSync } = require('fs');
// hexo.extend.filter.register('before_generate', () => {
//     const file = readFileSync('layout/page.njk').toString();
//     hexo.theme.setView('page.njk', file);
// })


// 初始化对象存储域名 cosDomain
const cosDomain = hexo.config.cos_domain;
// preconnect
hexo.extend.injector.register('head_begin', () => {
    const vendorsCdnUrl = new URL(hexo.config.theme_config.vendors.custom_cdn_url);
    const vendorsCdn = vendorsCdnUrl.protocol + '//' + vendorsCdnUrl.hostname;
    return `
        <link rel="preconnect" href="${cosDomain}" crossorigin="">
        <link rel="preconnect" href="${vendorsCdn}" crossorigin="">
        <link rel="preconnect" href="https://cdn.helingqi.com" crossorigin="">`;
});


// 着重号
hexo.extend.tag.register('dot', function (args) {
    return `<span class="emphasis-point">${args.join(' ')}</span>`;
});


// 友链列表
hexo.extend.tag.register('linklist', function (args) {
    const iconSrc = cosDomain + '/links/' + args + '/';
    const jsonSrc = args + '.json';
    return `<div class="link-list" icon-src="${iconSrc}" json-src="${jsonSrc}"></div>`;
});


// 页面许可协议
const author = hexo.config.author;
const blogUrl = hexo.config.url;
hexo.extend.tag.register('license', function (args) {
    const url = blogUrl + '/' + args[0] +'/';
    return `
        <div class="license">
            <div class="license-title">${args[1]}</div>
            <div class="license-link">
                <a href="./">${url}</a>
            </div>
            <div class="license-meta">
                <div class="license-meta-item">
                    <div class="license-meta-title">作者</div>
                    <div class="license-meta-text">${author}</div>
                </div>
                <div class="license-meta-item">
                    <div class="license-meta-title">许可协议</div>
                    <div class="license-meta-text">禁止转载引用</div>
                </div>
            </div>
            <div class="license-statement">如需转载或引用本栏目作品，请先获得作者授权！</div>
        </div>`;
});


// 文艺清单
hexo.extend.tag.register('culturelist', function (args) {
    const coverSrc = cosDomain + '/culture/' + args + '/';
    const jsonSrc = args + '.json';
    return `<div class="culture-list" cover-src="${coverSrc}" json-src="${jsonSrc}"></div>`;
});


// 相册
// 如果输入是两个值，那么用 args[0]，args[1] 分别代表
hexo.extend.tag.register('album', function (args) {
    const photoSrc = cosDomain + '/album/' + args + '/';
    const jsonSrc = photoSrc + args + '.json';
    return `
        <style>
            .post-block { 
                padding-left: 10px;
                padding-right: 10px;
            }
        </style>
        <div class="album" photo-src="${photoSrc}" json-src="${jsonSrc}"></div>
    `;
});


// 子页面列表
hexo.extend.tag.register('subpagebox', function ([args, delimiter = '|', comment = '%'], content) {
    const links = content.split('\n').filter(line => line.trim() !== '').map(line => {
        const item = line.split(delimiter).map(arg => arg.trim());
        const imageSource = cosDomain + '/' + args + '/' + item[1] + '/' + item[2];
        if (item[0][0] === comment) return '';
        return `
            <div class="subpage-box-cover">
                <a href="${item[1]}/">
                    <p class="image-caption">${item[0]}</p>
                    <img alt="${item[0]}" src="${imageSource}">
                </a>
            </div>
        `;
    });
    return `<div class="subpage-box">${links.join('')}</div>`;
}, true);