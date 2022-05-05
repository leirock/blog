const yaml = require('js-yaml');
const path = require('path');
const { readdirSync, readFileSync, mkdirSync, writeFileSync } = require('fs');

const folders = ['books', 'documentaries', 'tv-movie'];

for(var i in folders) {
    const src = './source/culture/' + folders[i] + '/';
    const files = readdirSync(src);

    const dist = './public/culture/' + folders[i] + '/';
    try {
        mkdirSync(dist, {recursive: true});
    } catch ({ code }) {
        if (code !== 'EEXIST') throw code;
    }

    for(var j in files) {
        if(path.extname(files[j]) === ".yml") {
            try {
                var doc = yaml.load(readFileSync(src + files[j], 'utf8'));
                var output = dist + files[j].slice(0, -4) + '.json';
                writeFileSync(output, JSON.stringify(doc));
            } catch (e) {
                console.error(e);
            }
        }
    }
}