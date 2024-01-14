const yaml = require('js-yaml');
const path = require('path');
const { readdirSync, readFileSync, mkdirSync, writeFileSync } = require('fs');

const linksSrc = './source/links/';
const linksDist = './public/links/';

try {
    mkdirSync(linksDist, { recursive: true });
} catch (error) {
    if (error.code !== 'EEXIST') {
        throw error;
    }
}

const files = readdirSync(linksSrc);

for (const file of files) {
    if (path.extname(file) === ".yml") {
        try {
            const doc = yaml.load(readFileSync(path.join(linksSrc, file), 'utf8'));
            const output = path.join(linksDist, `${file.slice(0, -4)}.json`);
            writeFileSync(output, JSON.stringify(doc));
        } catch (error) {
            console.error(error);
        }
    }
}
