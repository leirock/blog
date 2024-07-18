const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs').promises;

const linksSrc = './source/links/';
const linksDist = './public/links/';

async function convertYamlToJson() {
    try {
        await fs.mkdir(linksDist, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }

    const files = await fs.readdir(linksSrc);

    for (const file of files) {
        const filePath = path.join(linksSrc, file);
        const stat = await fs.stat(filePath);
        if (stat.isFile() && path.extname(file) === '.yml') {
            try {
                const doc = yaml.load(await fs.readFile(filePath, 'utf8'));
                const outputFile = path.join(linksDist, `${path.basename(file, '.yml')}.json`);
                await fs.writeFile(outputFile, JSON.stringify(doc));
            } catch (error) {
                console.error(`Error converting ${file}:`, error);
            }
        }
    }
}

convertYamlToJson().catch(console.error);