const base = require('./base.config.js');
const webpack = require('webpack');
const path = require('path');

const devPlugins = [
    new webpack.NamedModulesPlugin(),
];
base.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader', 'postcss-loader'],
});
module.exports = {
    mode: 'development',
    entry: base.entry,
    context: path.resolve(__dirname, '../resource'),
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: '/dev/',
        // path: path.resolve(__dirname, 'dist')
    },
    module: base.module,
    resolve: base.resolve,
    devtool: 'eval-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, '../resource/'),
        compress: true,
        port: 9999,
        host: '0.0.0.0',
        hot: true,
        // historyApiFallback: {
        //     rewrites: [{
        //         from: /test/,
        //         to: '/index.html'
        //     }]
        // },
        historyApiFallback: true,
        proxy: {
            '/': {
                target: 'http://localhost:3000',
            },
        },
        stats: 'minimal',
    },
    plugins: base.plugins.concat(devPlugins),
    performance: {
        hints: 'warning',
    },
};