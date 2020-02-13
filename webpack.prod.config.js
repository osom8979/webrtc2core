const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const root_dir = path.resolve(__dirname)
const src_dir = path.join(root_dir, 'src')
const dest_dir = path.join(root_dir, 'dest')

module.exports = {
  context: src_dir,
  mode: "production",
  entry: {
      webrtc2core: path.join(src_dir, 'webrtc2core.ts')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
  output: {
    path: dest_dir,
    filename: '[name].min.js',
    libraryTarget: 'umd',
    library: 'libwebrtc2core'
  }
};
