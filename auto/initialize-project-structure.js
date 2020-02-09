const fs = require('fs-extra');

if (!fs.existsSync('src')) {
    fs.mkdirSync('src');
}
fs.copySync('./node_modules/swim/demo', './src/');

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}
// update swim core
require('./update-core.js');

const package = fs.readJSONSync('package.json');
package.scripts['swim-update'] = 'npm install https://github.com/miterfrants/swim.git && node node_modules/swim/auto/update-core.js';
package.scripts['swim-init'] = 'node node_modules/swim/auto/initialize-project-structure.js';
package.scripts['swim-build'] = 'node node_modules/swim/auto/cacher-for-webpack.js && npx webpack --config ./src/webpack.config.js';
fs.writeJSONSync('package.json', package, {
    spaces: 2,
    EOL: '\r\n'
})