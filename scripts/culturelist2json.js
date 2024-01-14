const yaml = require('js-yaml');
const path = require('path');
const { readdirSync, readFileSync, mkdirSync, writeFileSync, stat } = require('fs');

const artSrc = './source/arts/';
const artDist = './public/arts/';
const workTypes = readdirSync(artSrc);

for (const workType of workTypes) {
    stat(path.join(artSrc, workType), (err, stats) => {
        if (err || !stats.isDirectory()) {
            return;
        }

        const workTypeDist = path.join(artDist, workType, '/');
        try {
            mkdirSync(workTypeDist, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }

        const workTypeSrc = path.join(artSrc, workType, '/');
        const files = readdirSync(workTypeSrc);

        for (const file of files) {
            if (path.extname(file) === ".yml") {
                const doc = yaml.load(readFileSync(path.join(workTypeSrc, file), 'utf8'));
                const output = path.join(workTypeDist, `${file.slice(0, -4)}.json`);
                writeFileSync(output, JSON.stringify(doc));
            }
        }
    });
}
