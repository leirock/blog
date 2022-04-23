// Generate friends list in JSON format
const yaml = require('js-yaml');
const { readdirSync, readFileSync, mkdirSync, writeFileSync } = require('fs');

const src = './source/links/';
const dist = './public/links/';

try {
    mkdirSync(dist, {recursive: true});
} catch ({ code }) {
    if (code !== 'EEXIST') throw code;
}

var files = readdirSync(src);
var path = require('path');

for(var i in files) {
    if(path.extname(files[i]) === ".yml") {
        try {
            const doc = yaml.load(readFileSync(src + files[i], 'utf8'));
            writeFileSync(dist + files[i].slice(0, -3) + 'json', JSON.stringify(doc));
        } catch (e) {
            console.error(e);
        }
    }
}
