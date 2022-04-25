// Generate friends list in JSON format
const yaml = require('js-yaml');
const path = require('path');
const { readdirSync, readFileSync, mkdirSync, writeFileSync } = require('fs');

const src = './source/links/';
const files = readdirSync(src);

const dist = './public/links/';
try {
    mkdirSync(dist, {recursive: true});
} catch ({ code }) {
    if (code !== 'EEXIST') throw code;
}

for(var i in files) {
    if(path.extname(files[i]) === ".yml") {
        try {
            var doc = yaml.load(readFileSync(src + files[i], 'utf8'));
            var output = dist + files[i].slice(0, -4) + '.json';
            writeFileSync(output, JSON.stringify(doc));
        } catch (e) {
            console.error(e);
        }
    }
}
