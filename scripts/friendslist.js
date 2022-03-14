// Generate friends list in JSON format
// See https://github.com/SukkaW/Friends

const yaml = require('js-yaml');
const { readFileSync, mkdirSync, writeFileSync } = require('fs');

// Get document, or throw exception on error
try {
    const doc = yaml.load(readFileSync('./source/friends/friendslist.yml', 'utf8'));
    try {
        mkdirSync('./public/friends/');
    } catch ({ code }) {
        if (code !== 'EEXIST') throw code;
    }
    writeFileSync('./public/friends/friendslist.json', JSON.stringify(doc));
} catch (e) {
    console.error(e);
}