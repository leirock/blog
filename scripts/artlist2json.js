const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs').promises;

const artSrc = './source/arts/';
const artDist = './public/arts/';

async function convertYamlToJson() {
    const workTypes = await fs.readdir(artSrc);

    for (const workType of workTypes) {
        const workTypePath = path.join(artSrc, workType);
        const stats = await fs.stat(workTypePath);

        if (!stats.isDirectory()) {
            continue;
        }

        const workTypeDist = path.join(artDist, workType);
        await fs.mkdir(workTypeDist, { recursive: true }).catch(() => {});

        const workTypeSrc = path.join(artSrc, workType);
        const files = await fs.readdir(workTypeSrc);

        for (const file of files) {
            if (path.extname(file) === '.yml') {
                const filePath = path.join(workTypeSrc, file);
                const doc = yaml.load(await fs.readFile(filePath, 'utf8'));
                const outputFile = path.join(workTypeDist, `${path.basename(file, '.yml')}.json`);
                await fs.writeFile(outputFile, JSON.stringify(doc));
            }
        }
    }
}

convertYamlToJson().catch(console.error);