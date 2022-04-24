const fs = require('fs-extra');

fs.copyFileSync(`./src/config.${process.env.NODE_ENV}.js`, './src/config.js');

if(process.env.FORCE_UPDATE !== 'true'){
    if(fs.existsSync('./src/swim/cacher.js')){
        return;
    }
}

const components = fs.readdirSync('./src/components', {
    withFileTypes: true
}).filter(dir => dir.isDirectory()).map((dir) => {
    return dir.name;
});

const template = fs.readdirSync('./src/template');
const css = process.env.SKIP_CSS ? [] : fs.readdirSync('./src/css').filter(filename => filename.endsWith('.css'));
const scss = process.env.SKIP_SCSS ? [] : fs.readdirSync('./src/css').filter(filename => filename.endsWith('.scss'));

const componentTemplate = `import {
    {ComponentCamelCaseName}Component
} from '../components/{ComponentSnakeCaseName}/{ComponentSnakeCaseName}.component.js';
import {ComponentCamelCaseName}HTML from '../components/{ComponentSnakeCaseName}/{ComponentSnakeCaseName}.html';
{css};
`;
const importResult = [];
const cacheResult = [];
const exportResult = `/* Auto Generate */
\/\/ command line \`node build-cache.js\`
{import}
export const Cacher = {
    buildCache: () => {
        window.APP_CONFIG = APP_CONFIG;
        window.SwimAppComponents = window.SwimAppComponents || [];
        window.SwimAppLoaderCache = window.SwimAppLoaderCache || [];
{cache}
    }
}`

const snakeToCamel = (str) => str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
    .replace('-', '')
    .replace('_', '')
);

for (let i = 0; i < components.length; i++) {
    const componentSnakeCaseName = components[i];
    let componentCamelCaseName = snakeToCamel(componentSnakeCaseName);
    componentCamelCaseName = componentCamelCaseName.substring(0, 1).toUpperCase() + componentCamelCaseName.substring(1);
    let componentResult = componentTemplate.replace(/{ComponentSnakeCaseName}/gi, componentSnakeCaseName).replace(/{ComponentCamelCaseName}/gi, componentCamelCaseName);
    if (fs.existsSync(`./src/components/${componentSnakeCaseName}/${componentSnakeCaseName}.scss`)) {
        componentResult = componentResult.replace(/{css}/gi, `import '../components/${componentSnakeCaseName}/${componentSnakeCaseName}.scss'`);
        cacheResult.push(`        window.SwimAppStylesheet.push(\`\${APP_CONFIG.FRONT_END_PREFIX}/components/${componentSnakeCaseName}/${componentSnakeCaseName}.css\`);`);
    } else if (fs.existsSync(`./src/components/${componentSnakeCaseName}/${componentSnakeCaseName}.css`)) {
        componentResult = componentResult.replace(/{css}/gi, `import '../components/${componentSnakeCaseName}/${componentSnakeCaseName}.css'`);
        cacheResult.push(`        window.SwimAppStylesheet.push(\`\${APP_CONFIG.FRONT_END_PREFIX}/components/${componentSnakeCaseName}/${componentSnakeCaseName}.css\`);`);
    } else {
        componentResult = componentResult.replace(/{css};/gi, '');
    }
    importResult.push(componentResult);

    cacheResult.push(`        window.SwimAppComponents.${componentCamelCaseName}Component = ${componentCamelCaseName}Component;`);
    cacheResult.push(`        window.SwimAppLoaderCache[\`\${APP_CONFIG.FRONT_END_PREFIX}/components/${componentSnakeCaseName}/${componentSnakeCaseName}.html\`] = ${componentCamelCaseName}HTML;`);
}

for (let i = 0; i < template.length; i++) {
    const fileNameWithoutExtend = snakeToCamel(template[i].split('.')[0]);
    importResult.push(`import ${fileNameWithoutExtend}HTML from '../template/${template[i]}';\r`);
    cacheResult.push(`        window.SwimAppLoaderCache[\`\${APP_CONFIG.FRONT_END_PREFIX}/template/${template[i]}\`] = ${fileNameWithoutExtend}HTML;`);
}

for (let i = 0; i < css.length; i++) {
    cacheResult.push(`        window.SwimAppStylesheet.push(\`\${APP_CONFIG.FRONT_END_PREFIX}/css/${css[i]}\`);`);
    importResult.push(`import '../css/${css[i]}';`);
}

for (let i = 0; i < scss.length; i++) {
    cacheResult.push(`        window.SwimAppStylesheet.push(\`\${APP_CONFIG.FRONT_END_PREFIX}/css/${scss[i].replace(/.scss/gi,'.css')}\`);`);
    importResult.push(`import '../css/${scss[i]}';`);
}

// import config
importResult.push('import { APP_CONFIG } from \'../config.js\';');
fs.writeFileSync('./src/swim/cacher.js', exportResult.replace(/{import}/gi, importResult.join('\r')).replace(/{cache}/gi, cacheResult.join('\r')));