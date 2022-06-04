const yaml = require('js-yaml');
const path = require('path');
const { readdirSync, readFileSync, mkdirSync, writeFileSync, stat } = require('fs');

const cultureSrc = './source/' + hexo.config.custom_page_path.culture + '/';
const cultureDist = './public/' + hexo.config.custom_page_path.culture + '/';
const mediaType = readdirSync(cultureSrc);

for (var i in mediaType) {
    stat(cultureSrc + mediaType[i], function (err, stats) {
        if (err) {
            return;
        }
        if (stats.isDirectory()) {
            const mediaTypeDist = cultureDist + mediaType[i] + '/';
            try {
                mkdirSync(mediaTypeDist, { recursive: true });
            } catch ({ code }) {
                if (code !== 'EEXIST') throw code;
            }

            const mediaTypeSrc = cultureSrc + mediaType[i] + '/';
            const files = readdirSync(mediaTypeSrc);
            for (var j in files) {
                if (path.extname(files[j]) === ".yml") {
                    var doc = yaml.load(readFileSync(mediaTypeSrc + files[j], 'utf8'));
                    var output = mediaTypeDist + files[j].slice(0, -4) + '.json';
                    writeFileSync(output, JSON.stringify(doc));
                }
            }
        }
    })
}