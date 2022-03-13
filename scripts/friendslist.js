// See https://github.com/SukkaW/Friends

try {
    const doc = yaml.load(readFileSync('/source/friends/friendslist.yml', 'utf8'));
    writeFileSync('/source/friends/friendslist.json', JSON.stringify(doc));
} catch (e) {
    console.error(e);
}