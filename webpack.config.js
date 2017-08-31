var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'dist');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
	entry: ['babel-polyfill', APP_DIR + '/index.js'],
	output: {
		path: BUILD_DIR,
		filename: 'script.js'
	},
	module : {
		rules: [
			{
				test : /\.jsx?/,
				include : APP_DIR,
				use : 'babel-loader'
			},
			{
				test:   /\.(scss|sass|css)$/,
				use: ExtractTextPlugin.extract([
					'css-loader',
					'postcss-loader',
					'sass-loader'
				])
				
			},
		]
	},
	plugins: [
		new ExtractTextPlugin('styles.css'),
		new webpack.optimize.UglifyJsPlugin({
			compress: true,
			comments: false
		}),
		new webpack.optimize.AggressiveMergingPlugin(),
		new HtmlWebpackPlugin({
			title: 'Switches',
			template: 'src/index.ejs',
		})
	],
};

module.exports = config;