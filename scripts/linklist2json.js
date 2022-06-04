const yaml = require('js-yaml');
const path = require('path');
const { readdirSync, readFileSync, mkdirSync, writeFileSync } = require('fs');

const linksSrc = './source/' + hexo.config.custom_page_path.links + '/';
const linksDist = './public/' + hexo.config.custom_page_path.links + '/';
const files = readdirSync(linksSrc);
try {
    mkdirSync(linksDist, { recursive: true });
} catch ({ code }) {
    if (code !== 'EEXIST') throw code;
}

for (var i in files) {
    if (path.extname(files[i]) === ".yml") {
        try {
            var doc = yaml.load(readFileSync(linksSrc + files[i], 'utf8'));
            var output = linksDist + files[i].slice(0, -4) + '.json';
            writeFileSync(output, JSON.stringify(doc));
        } catch (e) {
            console.error(e);
        }
    }
}