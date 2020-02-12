const path = require('path');

const root_dir = path.resolve(__dirname)
const src_dir = path.join(root_dir, 'src')
const dest_dir = path.join(root_dir, 'dest')

module.exports = {
  context: src_dir,
  mode: "development",
  devtool: 'inline-source-map',
  entry: {
      main: path.join(src_dir, 'main.ts')
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
  output: {
    path: dest_dir,
    filename: 'webrtc2core.js'
  }
};
