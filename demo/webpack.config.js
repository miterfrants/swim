const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');


module.exports = {
    entry: './src/app-for-build.js',
    output: {
        filename: 'app.[hash].js',
        path: path.resolve(__dirname, './dist'),
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader']
        }, {
            test: /\.html$/i,
            loader: 'html-loader',
        }],
    },
    plugins: [
        new FixStyleOnlyEntriesPlugin(),
        new MiniCssExtractPlugin({
            filename: 'app.[hash].css'
        }),
        new HtmlWebpackPlugin({
            template: './src/build/index.html',
            filename: 'index.html'
        }),
        new CopyPlugin([{
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