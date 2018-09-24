const path = require('path');

module.exports = {
  mode: 'production',
  entry: [
    path.resolve(__dirname, '../../', './web/src/index.js')
  ],
  output: {
    libraryTarget: 'umd',
    library: 'imeskeys',
    path: path.resolve(__dirname, '../../', './web/dist'),
    filename: 'imeskeys.lib.js'
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }]
  },
  externals: {
    libsignal: 'libsignal'
  }
};
