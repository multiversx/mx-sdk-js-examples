//@ts-check
'use strict';

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require('path');
const webpack = require('webpack');

/** @type WebpackConfig */
const config = {
    mode: 'none',
    entry: {
        app: './src/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, './out'),
        libraryTarget: 'umd',
    },
    resolve: {
        mainFields: ['browser', 'module', 'main'],
        extensions: ['.ts', '.js'], // support ts-files and js-files
        alias: {
            // provides alternate implementation for node module and source files
        },
        fallback: {
            // Webpack 5 no longer polyfills Node.js core modules automatically.
            // see https://webpack.js.org/configuration/resolve/#resolvefallback
            // for the list of Node.js core module polyfills.
            assert: require.resolve("assert"),
            buffer: require.resolve("buffer"),
            stream: require.resolve("stream-browserify"),
            crypto: require.resolve("crypto-browserify"),
            path: require.resolve("path-browserify"),
            punycode: require.resolve("punycode"),
            fs: false,
        },
    },
    module: {
        rules: [
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ],
    externals: {
    },
    performance: {
        hints: false,
    },
    devtool: 'nosources-source-map', // create a source map that points to the original source file
};

module.exports = [config];
