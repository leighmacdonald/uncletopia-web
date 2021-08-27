const path = require('path')
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const devMode = process.env.NODE_ENV !== "production";
const paths = {
    src: path.join(__dirname, "src"),
    dist: path.join(__dirname, "dist")
};

module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/index.tsx')
    },
    output: {
        path: path.join(__dirname, '/dist/static'),
        publicPath: "/static/",
        filename:  devMode ? "[name].js" : "[name].[chunkhash:8].bundle.js",
        clean: true,
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'async',
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 10,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        }
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {loader: "ts-loader"},
            },
            {
                test: /\.s?[ac]ss$/i,
                use: [
                    "style-loader",
                    MiniCssExtractPlugin.loader,
                    // Creates `style` nodes from JS strings
                    // process.env.NODE_ENV !== "production"
                    //     ? "style-loader"
                    //     : MiniCssExtractPlugin.loader,
                    // // Translates CSS into CommonJS
                    "css-loader",
                    {
                        loader: "sass-loader",
                    },
                ],
            },
            {
                test: /\.(webm|mp3|webmanifest|zip)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                    }
                },
            },
            {
                test: /\.(jpg|jpeg|png|gif|svg|webp|ico)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                    }
                },
            },
        ]
    },
    plugins: [
        // new CopyPlugin({
        //     patterns: [
        //         { from: "src/index.html", to: "index.html" },
        //     ],
        // }),
        // new BundleAnalyzerPlugin(),
        new MiniCssExtractPlugin({
            filename: "index.css",
            chunkFilename: "index.css",
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.src, "index.html"),
            filename: path.join(paths.dist, "static", "index.html"),
            inject: true,
            hash: false,
            minify: {
                removeComments: !devMode,
                collapseWhitespace: !devMode,
                minifyJS: !devMode,
                minifyCSS: !devMode
            }
        })
    ],
}
