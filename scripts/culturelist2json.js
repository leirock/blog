const yaml = require('js-yaml');
const path = require('path');
const { readdirSync, readFileSync, mkdirSync, writeFileSync } = require('fs');

const cultureSrc = './source/' + hexo.config.custom_page_path.culture + '/';
const cultureDist = './public/' + hexo.config.custom_page_path.culture + '/';
//read subfolders in culture and define as mediaType
const mediaType = readdirSync(cultureSrc);

for(var i in mediaType) {
    if (path.extname(mediaType[i]) === "") { //foldrs only, exclude files 
        const mediaTypeSrc = cultureSrc + mediaType[i] + '/';
        const mediaTypeDist = cultureDist + mediaType[i] + '/';
        try {
            mkdirSync(mediaTypeDist, {recursive: true});
        } catch ({ code }) {
            if (code !== 'EEXIST') throw code;
        }
        
        const files = readdirSync(mediaTypeSrc);
        for(var j in files) {
            if (path.extname(files[j]) === ".yml") {
                try {
                    var doc = yaml.load(readFileSync(mediaTypeSrc + files[j], 'utf8'));
                    var output = mediaTypeDist + files[j].slice(0, -4) + '.json';
                    writeFileSync(output, JSON.stringify(doc));
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
}