// use strict';
const http = require('https');
const staticAlias = require('node-static-alias');
const fs = require('fs');
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