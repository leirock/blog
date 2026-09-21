'use strict';

/**
 * 相册图片尺寸索引生成器
 *
 * 1) 扫描 source/statics/album/ 下的每个一级子文件夹，读取其中所有图片的像素尺寸，
 *    在该子文件夹内生成与子文件夹同名的 json 文件，内容为字符串数组：
 *
 *        ["640.960 bruno-bd-v1uN0dlA9HA-unsplash.jpg", ...]
 *          └ 宽.高  └ 含后缀的完整文件名
 *
 *    该格式与 source/_data/body-end.njk 中的相册渲染逻辑严格对应：
 *        data[i].split(' ')[0]  -> 图片尺寸（宽.高）
 *        data[i].split(' ')[1]  -> 文件名（含后缀，用于拼 href / img src）
 *
 *    json 与图片同放在相册子文件夹里，是为了随图片一起上传到对象存储
 *    （页面通过 cos_domain + /album/<子文件夹>/<子文件夹>.json 读取）。
 *
 * 2) 因为 Hexo 先 load() 再执行 before_generate，构建期间新建的文件不会进入本轮
 *    source 资源列表，所以再借 after_generate 把 json 镜像一份到 public/ 下，
 *    保证 `hexo server` / 本地预览能直接取到（生产环境走对象存储，不受影响）。
 *
 * 运行方式：hexo generate / hexo server 时自动执行（无需手动调用）。
 * 也可单独执行：node scripts/image-size.js
 *
 * 性能：解析尺寸只读文件头（64KB，尺寸信息都在头部），并按「路径 + 大小 + mtime」
 * 在进程内缓存，未变化的图片不会重复读盘（hexo server 反复重建时收益明显）。
 */

const fs = require('fs').promises;
const path = require('path');

const hasHexo = typeof hexo !== 'undefined' && hexo && hexo.base_dir;
const BASE_DIR = hasHexo ? hexo.base_dir : path.resolve(__dirname, '..');
const SOURCE_DIR = (hasHexo && hexo.config && hexo.config.source_dir) || 'source';
const PUBLIC_DIR = (hasHexo && hexo.config && hexo.config.public_dir) || 'public';

/** 相册根目录：source/statics/album/ */
const ALBUM_DIR = path.resolve(BASE_DIR, SOURCE_DIR, 'statics', 'album');
/** 镜像目录：public/statics/album/ */
const PUBLIC_ALBUM_DIR = path.resolve(BASE_DIR, PUBLIC_DIR, 'statics', 'album');

/** 参与索引的图片后缀（小写比较） */
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']);

/** 解析尺寸时只读取的文件头字节数（所有支持格式的尺寸都在头部） */
const HEAD_BYTES = 64 * 1024;

/** 有 hexo 全局时用 hexo.log，单独运行时退回 console */
const log = (hasHexo && hexo.log) ? hexo.log : console;

/* ------------------------------------------------------------------ *
 * 图片尺寸解析（零依赖，直接读文件头里的二进制元数据）
 * ------------------------------------------------------------------ */

/**
 * 按文件头魔数判断真实格式，避免扩展名与实际内容不一致导致误判
 * @param {Buffer} buf
 * @returns {string|null} jpeg | png | gif | webp | bmp | null
 */
function sniffType(buf) {
    if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
    if (buf.length >= 8 && buf.readUInt32BE(0) === 0x89504e47) return 'png';
    if (buf.length >= 6 && buf.toString('ascii', 0, 3) === 'GIF') return 'gif';
    if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
    if (buf.length >= 2 && buf.toString('ascii', 0, 2) === 'BM') return 'bmp';
    return null;
}

/**
 * 解析图片像素尺寸
 * @param {Buffer} buf 图片文件内容
 * @param {string} [label] 出错时用于提示的来源标识（一般是文件名）
 * @returns {{width:number, height:number}}
 */
function readImageSize(buf, label) {
    switch (sniffType(buf)) {
        case 'jpeg':
            return jpegSize(buf);
        case 'png':
            return pngSize(buf);
        case 'gif':
            return gifSize(buf);
        case 'webp':
            return webpSize(buf);
        case 'bmp':
            return bmpSize(buf);
        default:
            throw new Error(`无法识别的图片格式${label ? `（${label}）` : ''}`);
    }
}

function jpegSize(buf) {
    if (buf.readUInt16BE(0) !== 0xffd8) {
        throw new Error('不是合法的 JPEG 文件（缺少 SOI 标记）');
    }
    // 逐个扫描标记段，找到 SOF（Start Of Frame）段即可拿到宽高
    let offset = 2;
    while (offset < buf.length - 1) {
        if (buf[offset] !== 0xff) {
            offset += 1;
            continue;
        }
        const marker = buf[offset + 1];
        // 填充用的 0xff、以及无长度字段的标记，直接跳过
        if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
            offset += 2;
            continue;
        }
        const segLength = buf.readUInt16BE(offset + 2);
        const isSOF = marker >= 0xc0 && marker <= 0xcf &&
            marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isSOF) {
            return {
                height: buf.readUInt16BE(offset + 5),
                width: buf.readUInt16BE(offset + 7),
            };
        }
        offset += 2 + segLength;
    }
    throw new Error('JPEG 中未找到 SOF 段');
}

function pngSize(buf) {
    if (buf.readUInt32BE(0) !== 0x89504e47 || buf.readUInt32BE(4) !== 0x0d0a1a0a) {
        throw new Error('不是合法的 PNG 文件（签名不符）');
    }
    if (buf.toString('ascii', 12, 16) !== 'IHDR') {
        throw new Error('PNG 中未找到 IHDR 数据块');
    }
    return {
        width: buf.readUInt32BE(16),
        height: buf.readUInt32BE(20),
    };
}

function gifSize(buf) {
    if (buf.toString('ascii', 0, 3) !== 'GIF') {
        throw new Error('不是合法的 GIF 文件（签名不符）');
    }
    return {
        width: buf.readUInt16LE(6),
        height: buf.readUInt16LE(8),
    };
}

function webpSize(buf) {
    if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
        throw new Error('不是合法的 WebP 文件（签名不符）');
    }
    const format = buf.toString('ascii', 12, 16);
    if (format === 'VP8 ') {
        // 有损：帧头里 14 位有效宽度 / 高度
        return {
            width: buf.readUInt16LE(26) & 0x3fff,
            height: buf.readUInt16LE(28) & 0x3fff,
        };
    }
    if (format === 'VP8L') {
        // 无损：14 位宽 + 14 位高（均需 +1）
        const bits = buf.readUInt32LE(21);
        return {
            width: (bits & 0x3fff) + 1,
            height: ((bits >> 14) & 0x3fff) + 1,
        };
    }
    if (format === 'VP8X') {
        // 扩展：24 位宽 + 24 位高（均需 +1）
        return {
            width: buf.readUIntLE(24, 3) + 1,
            height: buf.readUIntLE(27, 3) + 1,
        };
    }
    throw new Error(`无法识别的 WebP 格式：${format}`);
}

function bmpSize(buf) {
    if (buf.toString('ascii', 0, 2) !== 'BM') {
        throw new Error('不是合法的 BMP 文件（签名不符）');
    }
    return {
        width: Math.abs(buf.readInt32LE(18)),
        height: Math.abs(buf.readInt32LE(22)),
    };
}

/* ------------------------------------------------------------------ *
 * 图片尺寸读取（只读文件头 + 进程内缓存）
 * ------------------------------------------------------------------ */

/** 同一个进程内按「路径 + 文件大小 + mtime」缓存尺寸，未变化的图片不重复解析 */
const sizeCache = new Map();

/**
 * 读取文件头部若干字节（所有支持格式的尺寸信息都在头部，无需读取整张图）
 * @param {string} filePath
 * @param {number} bytes
 * @returns {Promise<Buffer>}
 */
async function readFileHead(filePath, bytes) {
    const handle = await fs.open(filePath, 'r');
    try {
        const buf = Buffer.alloc(bytes);
        const { bytesRead } = await handle.read(buf, 0, bytes, 0);
        return buf.subarray(0, bytesRead);
    } finally {
        await handle.close();
    }
}

/**
 * 读取图片尺寸
 * - 命中缓存（大小与 mtime 都没变）直接返回，不读盘；
 * - 否则只读文件头（64KB）解析，头部被裁断时再回退读整文件。
 * @param {string} filePath
 * @param {string} [label] 出错时用于提示的来源标识
 * @returns {Promise<{width:number, height:number, cached:boolean}>}
 */
async function readImageSizeFromFile(filePath, label) {
    const stats = await fs.stat(filePath);
    const cached = sizeCache.get(filePath);
    if (cached && cached.size === stats.size && cached.mtimeMs === stats.mtimeMs) {
        return { width: cached.width, height: cached.height, cached: true };
    }

    let size = null;
    try {
        size = readImageSize(await readFileHead(filePath, Math.min(HEAD_BYTES, stats.size)), label);
    } catch (error) {
        // 头部信息不足以定位尺寸（例如 JPEG 的 SOF 段靠后），回退读整文件
    }
    if (!size) {
        size = readImageSize(await fs.readFile(filePath), label);
    }
    if (!size.width || !size.height) {
        throw new Error('读取到的尺寸为 0');
    }

    sizeCache.set(filePath, { size: stats.size, mtimeMs: stats.mtimeMs, width: size.width, height: size.height });
    return { width: size.width, height: size.height, cached: false };
}

/* ------------------------------------------------------------------ *
 * 索引生成
 * ------------------------------------------------------------------ */

/**
 * 为一个一级子文件夹生成 <子文件夹名>.json
 * @param {string} dirName 子文件夹名
 * @returns {Promise<{dir:string, count:number, changed:boolean}>}
 */
async function buildFolderIndex(dirName) {
    const dirPath = path.join(ALBUM_DIR, dirName);

    const files = (await fs.readdir(dirPath, { withFileTypes: true }))
        .filter(entry => entry.isFile() && IMAGE_EXTS.has(path.extname(entry.name).toLowerCase()))
        .map(entry => entry.name)
        // 数字友好排序，保证每次生成顺序稳定（相册按数组顺序分页渲染）
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }));

    if (files.length === 0) {
        return { dir: dirName, count: 0, changed: false };
    }

    const list = [];
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
            const { width, height } = await readImageSizeFromFile(filePath, `${dirName}/${file}`);
            if (file.includes(' ')) {
                // 渲染端用空格切分「尺寸」与「文件名」，含空格的文件名会解析错位
                log.warn(`[album] 文件名含空格，渲染时可能解析异常，建议改用连字符：${dirName}/${file}`);
            }
            list.push(`${width}.${height} ${file}`);
        } catch (error) {
            log.error(`[album] 跳过无法读取尺寸的图片：${dirName}/${file}（${error.message}）`);
        }
    }

    if (list.length === 0) {
        return { dir: dirName, count: 0, changed: false };
    }

    const outputFile = path.join(dirPath, `${dirName}.json`);
    const content = JSON.stringify(list);

    let previous = null;
    try {
        previous = await fs.readFile(outputFile, 'utf8');
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }

    if (previous === content) {
        return { dir: dirName, count: list.length, changed: false };
    }

    await fs.writeFile(outputFile, content);
    return { dir: dirName, count: list.length, changed: true };
}

/**
 * 遍历相册根目录下的所有一级子文件夹并生成索引
 * @returns {Promise<Array>} 每个子文件夹的处理结果
 */
async function generateAlbumIndex() {
    let entries;
    try {
        entries = await fs.readdir(ALBUM_DIR, { withFileTypes: true });
    } catch (error) {
        if (error.code === 'ENOENT') {
            log.warn(`[album] 相册目录不存在，已跳过：${ALBUM_DIR}`);
            return [];
        }
        throw error;
    }

    const dirNames = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();

    const results = [];
    for (const dirName of dirNames) {
        const result = await buildFolderIndex(dirName);
        results.push(result);

        if (result.count === 0) {
            log.info(`[album] ${dirName}：未发现图片，跳过`);
        } else if (result.changed) {
            log.info(`[album] ${dirName}：已生成 ${dirName}.json（${result.count} 张图片）`);
        } else {
            log.debug(`[album] ${dirName}：索引无变化，保持 ${dirName}.json（${result.count} 张图片）`);
        }
    }

    return results;
}

/**
 * 把 source 下的相册索引镜像到 public/，供 hexo server 与本地预览直接访问
 * （生产环境图片与 json 一起走对象存储，这一步不影响发布产物）
 * @returns {Promise<number>} 实际写入的文件数
 */
async function mirrorAlbumIndexToPublic() {
    let entries;
    try {
        entries = await fs.readdir(ALBUM_DIR, { withFileTypes: true });
    } catch (error) {
        if (error.code === 'ENOENT') return 0;
        throw error;
    }

    const dirNames = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
    let written = 0;

    for (const dirName of dirNames) {
        const sourceFile = path.join(ALBUM_DIR, dirName, `${dirName}.json`);
        let content;
        try {
            content = await fs.readFile(sourceFile, 'utf8');
        } catch (error) {
            if (error.code === 'ENOENT') continue;
            throw error;
        }

        const targetFile = path.join(PUBLIC_ALBUM_DIR, dirName, `${dirName}.json`);
        let previous = null;
        try {
            previous = await fs.readFile(targetFile, 'utf8');
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
        if (previous === content) continue;

        await fs.mkdir(path.dirname(targetFile), { recursive: true });
        await fs.writeFile(targetFile, content);
        written += 1;
    }

    if (written > 0) {
        log.debug(`[album] 已镜像 ${written} 个相册索引到 ${path.relative(BASE_DIR, PUBLIC_ALBUM_DIR)}/`);
    }
    return written;
}

/* ------------------------------------------------------------------ *
 * 入口
 * ------------------------------------------------------------------ */

// Hexo 加载 scripts/ 下的脚本时会注入 hexo 全局对象。
// 生成索引放在 before_generate：先于页面渲染完成，页面里引用的 json 一定存在；
// 镜像到 public 放在 after_generate：此时 public 目录已生成完毕。
if (hasHexo && hexo.extend && hexo.extend.filter) {
    hexo.extend.filter.register('before_generate', () => generateAlbumIndex());
    hexo.extend.filter.register('after_generate', () => mirrorAlbumIndexToPublic());
}

// 直接 `node scripts/image-size.js` 时执行一次（只更新 source 下的索引）
if (require.main === module) {
    generateAlbumIndex().catch(error => {
        console.error('[album] 生成相册索引失败：', error);
        process.exitCode = 1;
    });
}

module.exports = generateAlbumIndex;
module.exports.readImageSize = readImageSize;
module.exports.readImageSizeFromFile = readImageSizeFromFile;
module.exports.mirrorAlbumIndexToPublic = mirrorAlbumIndexToPublic;
