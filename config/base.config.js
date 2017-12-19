const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const path = require('path');

const entry = {
    app: './app.ts',
};

console.log(path.resolve(__dirname, '../tsconfig.vue.json'));
const wpModule = {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
    }, {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{
            loader: 'ts-loader',
            options: {
                configFile: path.resolve(__dirname, '../tsconfig.vue.json'),
                appendTsSuffixTo: [/\.vue$/],
            },
        }],
    }, {
        test: /\.vue$/,
        use: {
            loader: 'vue-loader',
            options: {
                esModule: true,
            },
        },
    }, {
        test: /\.(png|jpg|gif)$/,
        use: [{
            loader: 'url-loader',
            options: {
                limit: 1000,
            },
        }],
    }, {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
            loader: 'file-loader',
            options: {
                name: 'fonts/[name].[ext]',
            },
        }],
    }],
};

const plugins = [
    new HtmlWebpackPlugin({
        title: 'Better Konachan',
        template: 'index.ejs',
        chunks: ['app'],
    }),
    // new WebpackChunkHash(),
    // new ManifestPlugin({
    //     fileName:'myManifest.json'
    // }),
    // new ChunkManifestPlugin({
    //     filename: "chunk-manifest.json",
    //     manifestVariable: "webpackManifest",
    //      name: 'webpackManifest'
    // }),
    new InlineManifestWebpackPlugin({
        name: 'webpackManifest',
    }),
];

const resolve = {
    alias: {
        components: path.resolve(__dirname, '../resource/components'),
        modules: path.resolve(__dirname, '../resource/modules'),
        assets: path.resolve(__dirname, '../resource/assets/'),
        base: path.resolve(__dirname, '../resource/'),

    },
    modules: [path.resolve(__dirname, '../resource/modules'), 'node_modules'],
    extensions: ['.ts', '.css', '.json', '.vue', '.js'],
};
module.exports = {
    entry,
    module: wpModule,
    plugins,
    resolve,
};
