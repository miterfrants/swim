const fs = require('fs-extra');

const copySwimCoreModule = require('swim/auto-script/scripts/copy-swim-core');
copySwimCoreModule.copySwimCore();

fs.copyFileSync('node_modules/swim/demo/routing-rule.js', 'swim/routing-rule.js');
fs.copyFileSync('node_modules/swim/demo/app.js', 'app.js');
fs.copyFileSync('node_modules/swim/demo/index.html', 'index.html');
fs.copyFileSync('node_modules/swim/demo/server.js', 'server.js');
fs.copyFileSync('node_modules/swim/demo/config.js', 'config.js');
fs.copyFileSync('node_modules/swim/demo/config.dev.js', 'config.dev.js');
fs.copyFileSync('node_modules/swim/demo/constants.js', 'constants.js');
fs.copyFileSync('node_modules/swim/demo/.eslintrc.js', '.eslintrc.js');
fs.copyFileSync('node_modules/swim/demo/jsconfig.json', 'jsconfig.json');

if (!fs.existsSync('components')) {
    fs.mkdirSync('components');
}
fs.copySync('node_modules/swim/demo/components', 'components');

if (!fs.existsSync('controllers')) {
    fs.mkdirSync('controllers');
}
fs.copySync('node_modules/swim/demo/controllers', 'controllers');

if (!fs.existsSync('dataservices')) {
    fs.mkdirSync('dataservices');
}
fs.copySync('node_modules/swim/demo/dataservices', 'dataservices');

if (!fs.existsSync('template')) {
    fs.mkdirSync('template');
}
fs.copySync('node_modules/swim/demo/template', 'template');

if (!fs.existsSync('util')) {
    fs.mkdirSync('util');
}
fs.copySync('node_modules/swim/demo/util', 'util');

if (!fs.existsSync('css')) {
    fs.mkdirSync('css');
}
fs.copySync('node_modules/swim/demo/css', 'css');

if (!fs.existsSync('ssl')) {
    fs.mkdirSync('ssl');
}
fs.copySync('node_modules/swim/demo/ssl', 'ssl');

if (!fs.existsSync('api')) {
    fs.mkdirSync('api');
}
fs.copySync('node_modules/swim/demo/api', 'api');