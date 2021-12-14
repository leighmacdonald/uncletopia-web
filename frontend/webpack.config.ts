import * as path from 'path';
import * as webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const debugMode = process.env['NODE_ENV'] !== 'production';
const paths = {
    src: path.join(__dirname, 'src'),
    dist: path.join(__dirname, 'dist')
};

const config: webpack.Configuration = {
    entry: {
        main: [
            'babel-polyfill',
            path.resolve(__dirname, './src/index.tsx')
        ]
    },
    output: {
        path: path.join(__dirname, '/dist/static'),
        publicPath: '/static/',
        filename: debugMode ? '[name].js' : '[name].[chunkhash:8].bundle.js',
        clean: true
    },
    optimization: {
        // runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            // chunks: 'async',
            minSize: 2000,
            minRemainingSize: 0,
            minChunks: 10,
            maxAsyncRequests: 3,
            maxInitialRequests: 3,
            enforceSizeThreshold: 5000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
    devtool: debugMode ? 'inline-source-map' : false,
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: { loader: 'ts-loader' }
            },
            {
                test: /\.s?[ac]ss$/i,
                use: [
                    // "style-loader",
                    MiniCssExtractPlugin.loader,
                    // Creates `style` nodes from JS strings
                    // process.env.NODE_ENV !== "production"
                    //     ? "style-loader"
                    //     : MiniCssExtractPlugin.loader,
                    // // Translates CSS into CommonJS
                    'css-loader',
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.(webm|mp3|webmanifest|zip)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]'
                    }
                }
            },
            {
                test: /\.(jpg|jpeg|png|gif|svg|webp|ico)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]'
                    }
                }
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            // TODO dont hard code these
            patterns: [
                { from: 'src/images/android-chrome-192x192.png' },
                { from: 'src/images/android-chrome-512x512.png' },
                { from: 'src/images/apple-touch-icon.png' },
                { from: 'src/images/favicon.svg' },
                { from: 'src/images/favicon-16x16.png' },
                { from: 'src/images/favicon-32x32.png' },
                { from: 'src/images/site.webmanifest' }

            ]
        }),
        // new BundleAnalyzerPlugin(),
        new MiniCssExtractPlugin({
            filename: 'index.css',
            chunkFilename: 'index.css'
        }),
        new HtmlWebpackPlugin({
            template: path.join(paths.src, 'index.html'),
            filename: path.join(paths.dist, 'static', 'index.html'),
            inject: true,
            hash: false,
            minify: {
                removeComments: !debugMode,
                collapseWhitespace: !debugMode,
                minifyJS: !debugMode,
                minifyCSS: !debugMode
            }
        })
    ]
};

export default config;