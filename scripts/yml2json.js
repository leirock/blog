'use strict';

/**
 * yml 清单 → json 转换器（原 artlist2json.js + linklist2json.js 的合并版）
 *
 * 页面上的 {% artlist %} / {% linklist %} 标签只输出一个空的 div，真正的数据由
 * source/_data/body-end.njk 里的脚本用 XHR 拉取 json 后渲染。这里负责把源 yml
 * 转成那些 json，写进 public/ 供部署产物直接带出去。
 *
 * 目录约定（src 下的一级子目录名会成为 URL 的一层）：
 *     source/arts/<清单名>/<清单名>.yml   ->   public/arts/<清单名>/<清单名>.json
 *     source/links/<清单名>.yml           ->   public/links/<清单名>.json
 *
 * 运行方式：hexo generate / hexo server 时由 before_generate 过滤器自动执行。
 * 也可单独执行：node scripts/yml2json.js
 *
 * 注意：必须挂在 Hexo 的生命周期里，不能在脚本加载时（init 阶段）直接跑——
 * 那样会与 `hexo clean` 删除 public 目录形成竞态，导致 clean 报
 * ENOTEMPTY / ENOENT 且删不干净。
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

const hasHexo = typeof hexo !== 'undefined' && hexo && hexo.base_dir;
const BASE_DIR = hasHexo ? hexo.base_dir : path.resolve(__dirname, '..');
const SOURCE_DIR = (hasHexo && hexo.config && hexo.config.source_dir) || 'source';
const PUBLIC_DIR = (hasHexo && hexo.config && hexo.config.public_dir) || 'public';
const log = (hasHexo && hexo.log) ? hexo.log : console;

/** 参与转换的后缀 */
const YAML_EXTS = new Set(['.yml', '.yaml']);

/**
 * 清单目录映射
 * src:  source 下的相对路径
 * dist: public 下的相对路径
 */
const TARGETS = [
    { src: 'arts', dist: 'arts', label: '文艺清单' },
    { src: 'links', dist: 'links', label: '友情链接' },
];

/**
 * 转换单个 yml 文件，内容无变化时不覆盖写入
 * @returns {Promise<boolean>} 是否发生了写入
 */
async function convertFile(srcFile, destFile) {
    const doc = yaml.load(await fs.readFile(srcFile, 'utf8'));
    const content = JSON.stringify(doc);

    let previous = null;
    try {
        previous = await fs.readFile(destFile, 'utf8');
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    if (previous === content) return false;

    await fs.mkdir(path.dirname(destFile), { recursive: true });
    await fs.writeFile(destFile, content);
    return true;
}

/**
 * 处理一个清单目录：一级子目录里的 yml 与根层的 yml 都会被转换
 * @returns {Promise<{ok:number, changed:number, fail:number}>}
 */
async function buildTarget({ src, dist, label }) {
    const srcDir = path.resolve(BASE_DIR, SOURCE_DIR, src);
    const distDir = path.resolve(BASE_DIR, PUBLIC_DIR, dist);
    const stat = { ok: 0, changed: 0, fail: 0 };

    let entries;
    try {
        entries = await fs.readdir(srcDir, { withFileTypes: true });
    } catch (error) {
        if (error.code === 'ENOENT') {
            log.warn(`[yml2json] ${label}目录不存在，已跳过：${srcDir}`);
            return stat;
        }
        throw error;
    }

    // 收集「源文件 -> 目标文件」的对应关系
    const jobs = [];
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const subDir = path.join(srcDir, entry.name);
            for (const file of await fs.readdir(subDir, { withFileTypes: true })) {
                if (!file.isFile() || !YAML_EXTS.has(path.extname(file.name).toLowerCase())) continue;
                jobs.push({
                    srcFile: path.join(subDir, file.name),
                    destFile: path.join(distDir, entry.name, `${path.basename(file.name, path.extname(file.name))}.json`),
                });
            }
        } else if (entry.isFile() && YAML_EXTS.has(path.extname(entry.name).toLowerCase())) {
            jobs.push({
                srcFile: path.join(srcDir, entry.name),
                destFile: path.join(distDir, `${path.basename(entry.name, path.extname(entry.name))}.json`),
            });
        }
    }

    for (const { srcFile, destFile } of jobs) {
        const relative = path.relative(BASE_DIR, srcFile);
        try {
            if (await convertFile(srcFile, destFile)) stat.changed += 1;
            stat.ok += 1;
        } catch (error) {
            // 单个文件出错不影响其他清单
            stat.fail += 1;
            log.error(`[yml2json] 转换失败：${relative}（${error.message}）`);
        }
    }

    const target = path.relative(BASE_DIR, distDir);
    if (stat.changed > 0) {
        log.info(`[yml2json] ${label}：已写入 ${stat.changed} 个 json 到 ${target}/（共 ${stat.ok} 个）`);
    } else if (stat.ok > 0) {
        log.debug(`[yml2json] ${label}：${stat.ok} 个 json 无变化`);
    }
    if (jobs.length === 0) {
        log.warn(`[yml2json] ${label}：未找到任何 yml 文件（${path.relative(BASE_DIR, srcDir)}）`);
    }

    return stat;
}

/**
 * 转换全部清单目录
 * @returns {Promise<Array>} 各目录的处理结果
 */
async function buildAllTargets() {
    const results = [];
    for (const target of TARGETS) {
        results.push(await buildTarget(target));
    }
    return results;
}

/* ------------------------------------------------------------------ *
 * 入口
 * ------------------------------------------------------------------ */

if (hasHexo && hexo.extend && hexo.extend.filter) {
    hexo.extend.filter.register('before_generate', () => buildAllTargets());
}

if (require.main === module) {
    buildAllTargets().catch(error => {
        console.error('[yml2json] 转换失败：', error);
        process.exitCode = 1;
    });
}

module.exports = buildAllTargets;
