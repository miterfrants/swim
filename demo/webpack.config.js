const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const webpack = require('webpack');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');

module.exports = {
    entry: './src/app-for-build.js',
    output: {
        filename: 'app.[hash].js',
        path: path.resolve(__dirname, './dist'),
        publicPath: '/'
    },
    optimization: {
        minimizer: [
            new TerserJSPlugin({}),
            new CssMinimizerPlugin()
        ],
    },
    module: {
        rules: [{
            test: /\.js$/i,
            use: [{
                loader: 'string-replace-loader',
                options: {
                    search: 'xxxx-dev',
                    replace: process.env.NODE_ENV === 'prod' ? 'xxxx-prod' : 'xxxx-dev',
                }
            }]
        }, {
            test: /\.scss$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        }, {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader']
        }, {
            test: /\.html$/i,
            loader: 'html-loader',
            options: {
                minimize: true,
            }
        }],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new CleanWebpackPlugin(),
        new FixStyleOnlyEntriesPlugin(),
        new MiniCssExtractPlugin({
            filename: 'app.[hash].css'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
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