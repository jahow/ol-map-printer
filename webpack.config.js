const path = require('path')

module.exports = {
    mode: 'development',
    entry: {
        app: path.resolve(__dirname, 'src', 'index.js'),
        worker: path.resolve(__dirname, 'lib', 'print.worker.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    plugins: [],
    devtool: 'source-map',
    devServer: {
        contentBase: __dirname,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', {}],
                    },
                },
            }
        ],
    },
}