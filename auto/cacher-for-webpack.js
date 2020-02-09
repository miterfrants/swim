const fs = require('fs-extra');
const components = fs.readdirSync('./src/components', {
    withFileTypes: true
}).filter(dir => dir.isDirectory()).map((dir) => {
    return dir.name;
});

const template = fs.readdirSync('./src/template');

const componentTemplate = `import {
    {ComponentCamelCaseName}Component
} from '../components/{ComponentSnakeCaseName}/{ComponentSnakeCaseName}.component.js';
import {ComponentCamelCaseName}HTML from '../components/{ComponentSnakeCaseName}/{ComponentSnakeCaseName}.html';
`;
const importResult = [];
const cacheResult = [];
const exportResult = `/* Auto Generate */
\/\/ command line \`node build-cache.js\`
{import}
export const Cacher = {
    buildCache: () => {
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
    importResult.push(componentTemplate.replace(/{ComponentSnakeCaseName}/gi, componentSnakeCaseName).replace(/{ComponentCamelCaseName}/gi, componentCamelCaseName))
    cacheResult.push(`        window.SwimAppComponents['${componentCamelCaseName}Component'] = ${componentCamelCaseName}Component;`);
    cacheResult.push(`        window.SwimAppLoaderCache['/components/${componentSnakeCaseName}/${componentSnakeCaseName}.html'] = ${componentCamelCaseName}HTML;`);
}

for (let i = 0; i < template.length; i++) {
    const fileNameWithoutExtend = snakeToCamel(template[i].split('.')[0]);
    importResult.push(`import ${fileNameWithoutExtend}HTML from '../template/${template[i]}';\r\n`);
    cacheResult.push(`        window.SwimAppLoaderCache['/template/${template[i]}'] = ${fileNameWithoutExtend}HTML;`);
}
fs.writeFileSync('./src/swim/cacher.js', exportResult.replace(/{import}/gi, importResult.join('\r\n')).replace(/{cache}/gi, cacheResult.join('\r\n')));