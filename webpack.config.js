const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const path = require('path');
const DelWebpackPlugin = require('del-webpack-plugin');

const config = {
    entry: {
        'dm': "./src/entry.ts",
    },
    optimization: {
        usedExports: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.((c|sa|sc)ss)$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                    'postcss-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: []
}

module.exports = (env, argv) => {
    const dotenv = new Dotenv();
    const isProd = argv.mode === 'production';

    config.plugins.push(dotenv);
    config.output = {
        path: path.resolve(__dirname, 'dist'),
        filename: isProd ? '[name].min.js' : '[name].js',
        chunkFilename: isProd ? '[id].min.chunk.js' : '[id].chunk.js',
    };

    // For more option please visit https://webpack.js.org/configuration/devtool/
    switch (env) {
        case 'dev':
            config.devtool = 'eval';
            break;
        case 'staging':
            config.devtool = 'source-map';
            break;
    }


    if (env === 'prod') {
        config.plugins.push(
            new DelWebpackPlugin({
                include: ['**'],
                exclude: [],
                info: true,
                keepGeneratedAssets: true,
                allowExternal: false
            })
        );
    }


    return config;
}
