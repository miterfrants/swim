const fs = require('fs-extra');

if (!fs.existsSync('src')) {
    fs.mkdirSync('src');
}
fs.copySync('./node_modules/swim/demo', './src/');
fs.copySync('./node_modules/swim/demo/webpack.config.js', './webpack.config.js');
fs.removeSync('./src/webpack.config.js');

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}
// update swim core
require('./update-core.js');

const package = fs.readJSONSync('package.json');
package.scripts['swim-update'] = 'npm install https://github.com/miterfrants/swim.git && node node_modules/swim/auto/update-core.js';
package.scripts['swim-build'] = 'node node_modules/swim/auto/cacher-for-webpack.js && npx webpack --config ./webpack.config.js';
fs.writeJSONSync('package.json', package, {
    spaces: 2,
    EOL: '\r\n'
})