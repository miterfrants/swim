const fs = require('fs-extra');

const swimCoreFile = fs.readdirSync('./node_modules/swim/', {
    withFileTypes: true
}).filter(dir => !dir.isDirectory());

if (!fs.existsSync('./src/swim')) {
    fs.mkdirSync('./src/swim');
}

for (let i = 0; i < swimCoreFile.length; i++) {
    const fileName = swimCoreFile[i].name
    fs.copyFileSync(`./node_modules/swim/${fileName}`, `./src/swim/${fileName}`);
}