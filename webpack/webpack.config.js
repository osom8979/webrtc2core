var path = require('path');

const root_dir = path.resolve(__dirname, '..')
const src_dir = path.join(root_dir, 'src')
const dest_dir = path.join(root_dir, 'dest')

module.exports = {
  context: src_dir,
  entry: {
      main: path.join(src_dir, 'main.js')
  },
  output: {
    path: dest_dir,
    filename: 'webrtc2core.js'
  }
};
