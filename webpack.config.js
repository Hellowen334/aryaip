const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  target: ['web', 'es5'],
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] }
    ]
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new HtmlWebpackPlugin({ template: './public/index.html', scriptLoading: 'blocking' }),
    new CopyPlugin({
      patterns: [
        { from: 'appinfo.json', to: 'appinfo.json' },
        { from: 'icon.png', to: 'icon.png', noErrorOnMissing: true },
        { from: 'largeIcon.png', to: 'largeIcon.png', noErrorOnMissing: true }
      ]
    })
  ]
};