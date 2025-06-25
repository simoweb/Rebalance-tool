const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      favicon: './public-assets/favicon.svg',
       minify: isProduction && {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        useShortDoctype: true,
      }
    }),
    // Copia il file index-en.html nella cartella public
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './public/index-en.html',
          to: 'index-en.html'
        }
      ]
    }),
    ...(isProduction ? [new MiniCssExtractPlugin({ filename: 'styles.css' })] : [])
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    hot: true,
    open: true,
    // Configurazione per gestire il routing delle lingue
    historyApiFallback: {
      rewrites: [
        // Reindirizza /en a index-en.html
        { from: /^\/en$/, to: '/index-en.html' },
        { from: /^\/en\//, to: '/index-en.html' },
        // Tutti gli altri percorsi vanno a index.html
        { from: /./, to: '/index.html' }
      ]
    }
  },
  optimization: {
  minimize: isProduction,
  minimizer: [
    '...', // preserva TerserPlugin per JS
    new CssMinimizerPlugin(),
  ],
},
  mode: isProduction ? 'production' : 'development'
};
