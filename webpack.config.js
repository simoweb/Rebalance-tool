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
      favicon: './public/favicon.svg',
       minify: isProduction && {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        useShortDoctype: true,
      }
    }),
    // Copia i file statici nella cartella public
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './public/index-en.html',
          to: path.resolve(__dirname, 'public', 'index-en.html')
        },
        {
          from: './public/sitemap.xml',
          to: path.resolve(__dirname, 'public', 'sitemap.xml')
        },
        {
          from: './public/robots.txt',
          to: path.resolve(__dirname, 'public', 'robots.txt')
        },
        {
          from: './public/sitemap.xsl',
          to: path.resolve(__dirname, 'public', 'sitemap.xsl')
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
    // Configurazione semplice per il routing
    historyApiFallback: {
      index: '/index.html',
      rewrites: [
        { from: /^\/en/, to: '/index-en.html' }
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
