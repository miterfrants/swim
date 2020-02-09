const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
    entry: './src/app-for-build.js',
    output: {
        filename: 'app.[hash].js',
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.html$/i,
            loader: 'html-loader',
        }],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/build/index.html',
            filename: 'index.html'
        }),
        new CopyPlugin([{
            from: './src/css',
            to: './css'
        }, {
            from: './src/api',
            to: './api'
        }, {
            from: './src/ssl',
            to: './ssl'
        }, {
            from: './src/server.js',
            to: './server.js'
        }])
    ]
};