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
// 页面中的资源 URL 全靠 cosDomain 拼绝对路径，缺配置会让所有地址变形，提前报出来
if (!cosDomain) {
    hexo.log.warn('[inline-tags] _config.yml 缺少 cos_domain 配置，页面中的资源 URL 会拼接异常');
}
// 站点根路径（默认 '/'）；清单 json 由站点自身提供，需拼成绝对地址
const siteRoot = hexo.config.root || '/';

/**
 * 取标签的第一个参数并校验参数个数
 * @param {string[]} args 标签参数
 * @param {string} tagName 标签名，仅用于日志
 */
function firstArg(args, tagName) {
    if (args.length > 1) {
        hexo.log.warn(`[${tagName}] 只接受 1 个参数，多余的已忽略：${args.join(' ')}`);
    }
    return args[0];
}

/**
 * 许可协议卡片
 * {% license %} 标签与 source/_data/post-body-end.njk（经 license_box helper）共用这一份实现，
 * 避免同一段结构维护两份。
 */
function renderLicenseBox(options) {
    const {
        title = '',
        linkHref = '',
        linkText = '',
        authorLabel = '作者',
        authorName = '',
        published = '',
        updated = '',
        origSrc = '',
        origUrl = '',
        ccLicense = false,
        hasOrigAuthor = false,
        statement = '',
    } = options;

    const metaRow = (label, value) => (value
        ? `<div class="license-meta-item"><div class="license-meta-title">${label}</div><div class="license-meta-text">${value}</div></div>`
        : '');

    const origRow = origSrc
        ? metaRow('原文出处', origUrl ? `<a href="${origUrl}" rel="noopener" target="_blank">${origSrc}</a>` : origSrc)
        : '';

    let licenseText;
    if (hasOrigAuthor) {
        licenseText = '原作许可协议';
    } else if (ccLicense) {
        licenseText = '<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" rel="noopener" target="_blank">CC BY-NC-SA 4.0</a>';
    } else {
        licenseText = '禁止转载引用';
    }

    let licenseStatement = statement;
    if (!licenseStatement) {
        if (hasOrigAuthor) {
            licenseStatement = '转载或引用本文时，请遵守原作许可协议！';
        } else if (ccLicense) {
            licenseStatement = '转载或引用本文时，请遵守上述许可协议，注明出处、不得用于商业用途！';
        } else {
            licenseStatement = '如需转载或引用本文，请先获得作者授权！';
        }
    }

    return `
        <div class="license">
            <div class="license-title">${title}</div>
            <div class="license-link">
                <a href="${linkHref}">${linkText}</a>
            </div>
            <div class="license-meta">
                <div class="license-meta-item">
                    <div class="license-meta-title">${authorLabel}</div>
                    <div class="license-meta-text">${authorName}</div>
                </div>${metaRow('发布于', published)}${metaRow('更新于', updated)}${origRow}
                <div class="license-meta-item">
                    <div class="license-meta-title">许可协议</div>
                    <div class="license-meta-text">${licenseText}</div>
                </div>
            </div>
            <div class="license-statement">${licenseStatement}</div>
        </div>`;
}

// 供 source/_data/post-body-end.njk 调用
hexo.extend.helper.register('license_box', renderLicenseBox);


// preconnect
hexo.extend.injector.register('head_begin', () => {
//    const vendorsCdnUrl = new URL(hexo.config.theme_config.vendors.custom_cdn_url);
//    const vendorsCdn = vendorsCdnUrl.protocol + '//' + vendorsCdnUrl.hostname;
//    <link rel="preconnect" href="${vendorsCdn}" crossorigin="">
    return `
        <link rel="preconnect" href="${cosDomain}" crossorigin="">`;
});


// 着重号
hexo.extend.tag.register('dot', function (args) {
    return `<span class="emphasis-point">${args.join(' ')}</span>`;
});


// 页面许可协议：{% license <页面目录名> <标题> %}
const author = hexo.config.author;
const blogUrl = hexo.config.url;
hexo.extend.tag.register('license', function (args) {
    const url = `${blogUrl}/${args[0]}/`;
    if (args.length < 2) {
        hexo.log.warn(`[license] 用法：{% license <页面目录名> <标题 %}，标题缺失：${args.join(' ')}`);
    }
    return renderLicenseBox({
        title: args[1],
        linkHref: './',
        linkText: url,
        authorLabel: '作者',
        authorName: author,
        statement: '如需转载或引用本栏作品，请先获得作者授权！',
    });
});


// 友链列表：{% linklist <清单名> %}
// json 由 scripts/yml2json.js 生成在 public/links/<清单名>.json
hexo.extend.tag.register('linklist', function (args) {
    const name = firstArg(args, 'linklist');
    const iconSrc = `${cosDomain}/links/`;
    const jsonSrc = `${siteRoot}links/${name}.json`;
    return `<div class="link-list" icon-src="${iconSrc}" json-src="${jsonSrc}"></div>`;
});


// 文艺清单：{% artlist <清单名> %}
// json 由 scripts/yml2json.js 生成在 public/arts/<清单名>/<清单名>.json
hexo.extend.tag.register('artlist', function (args) {
    const name = firstArg(args, 'artlist');
    const coverSrc = `${cosDomain}/arts/${name}/`;
    const jsonSrc = `${siteRoot}arts/${name}/${name}.json`;
    return `<div class="art-list" cover-src="${coverSrc}" json-src="${jsonSrc}"></div>`;
});


// 相册：{% album <子文件夹名> %}
// 参数为 source/statics/album/ 下的一级子文件夹名。
// grid-src 用于按需加载 Minigrid——只有含相册的页面才需要它，不必全站引入。
hexo.extend.tag.register('album', function (args) {
    const name = firstArg(args, 'album');
    const photoSrc = `${cosDomain}/album/${name}/`;
    const jsonSrc = `${photoSrc}${name}.json`;
    const gridSrc = `${cosDomain}/minigrid.min.js`;
    return `<div class="album" photo-src="${photoSrc}" json-src="${jsonSrc}" grid-src="${gridSrc}"></div>`;
});


// 子页面列表
// 每行格式：标题 | 子目录名 | 封面文件名
hexo.extend.tag.register('subpagebox', function ([args, delimiter = '|', comment = '%'], content) {
    const dir = args;
    const covers = [];

    for (const rawLine of content.split('\n')) {
        const line = rawLine.trim();
        if (line === '' || line.startsWith(comment)) continue;

        const item = line.split(delimiter).map(arg => arg.trim());
        if (item.length < 3 || !item[1] || !item[2]) {
            hexo.log.warn(`[subpagebox] 每行格式应为「标题${delimiter}子目录${delimiter}封面文件名」，已跳过：${line}`);
            continue;
        }

        const [caption, subDir, cover] = item;
        covers.push(`
            <div class="subpage-box-cover">
                <a href="${subDir}/">
                    <p class="image-caption">${caption}</p>
                    <img loading="lazy" alt="${caption}" src="${cosDomain}/${dir}/${subDir}/${cover}">
                </a>
            </div>
        `);
    }

    return `<div class="subpage-box">${covers.join('')}</div>`;
}, true);
