// webpack.config.js

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
	entry: "./src/main.js",
	output: {
		path: path.join(__dirname, "/dist"),
		filename: "bundle.[contenthash].js",
		assetModuleFilename: "asset/[hash][ext][query]",
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
			},
			{
				test: /\.(png|jpg|gif|svg)$/i,
				type: "asset/resource"
			}
		],
	},
	resolve: {
		extensions: [".js", ".jsx"]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./public/index.html"
		}),
		new MiniCssExtractPlugin({
			filename: "style.[contenthash].css",
		})
	],
	devServer: {
		hot: true,
		liveReload: false
	},
	optimization: {
		minimizer: [
			new CssMinimizerPlugin(),
		]
	}
};
