const fs = require('fs');

copySwimCore = () => {
    if (!fs.existsSync('swim')) {
        fs.mkdirSync('swim');
    }
    fs.copyFileSync('node_modules/swim/router.js', 'swim/router.js');
    fs.copyFileSync('node_modules/swim/render.js', 'swim/render.js');
    fs.copyFileSync('node_modules/swim/loader.js', 'swim/loader.js');
    fs.copyFileSync('node_modules/swim/base.component.js', 'swim/base.component.js');
    fs.copyFileSync('node_modules/swim/routing-controller.js', 'swim/routing-controller.js');
}
exports.copySwimCore = copySwimCore