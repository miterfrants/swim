// use strict';
const http = require('https');
const staticAlias = require('node-static-alias');
const fs = require('fs');
const path = require('path');

var fileServer = new staticAlias.Server('./', {
    alias: [{
        match: /\/config.js$/,
        serve: process.env.NODE_ENV === 'prod' ? 'config.js' : 'config.dev.js'
    }, {
        match: /\/([^/]+\/)*$/,
        serve: 'index.html'
    }, {
        match: /\/([^/]+\/)*([^/]+)\.(js|css|png|woff2|woff|ttf|html|gif|svg|json|jpg)$/,
        serve: function (params) {
            return params.reqPath;
        },
    }]
});

const options = {
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/server.crt')
};

http.createServer(options, function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(443);
console.log('Sever Launch: port 443');

const scssFiles = recursiveExtractCssFile('./');
var sass = require('node-sass');
for (let i = 0; i < scssFiles.length; i++) {
    const outputFileName = path.dirname(scssFiles[i]) + path.basename(scssFiles[i]).replace(path.extname(scssFiles[i]), '.css');
    sass.render({
        file: scssFiles[i],
        outFile: outputFileName
    }, (error, result) => { // node-style callback from v3.0.0 onwards
        if (error) {
            console.error(error);
            return;
        }
        fs.writeFile(outputFileName, result.css, function (err) {
            if (err) {
                console.error(err);
                return;
            }
        });
    });
}

function recursiveExtractCssFile(folder) {
    const result = extractCssFile(folder);
    fs.readdirSync(folder, {
        withFileTypes: true
    }).forEach((file) => {
        if (file.isDirectory()) {
            result.push(...recursiveExtractCssFile(`${folder}${file.name}/`));
        }
    });
    return result;
}

function extractCssFile(folder) {
    return fs.readdirSync(folder, {
        withFileTypes: true
    }).map((file) => {
        if (!file.isDirectory() && path.extname(file.name) === '.scss') {
            return folder + '/' + file.name;
        }
    }).filter((item) => {
        return item !== undefined;
    });
}