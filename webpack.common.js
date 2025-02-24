const path = require('path');

module.exports = {
  entry: {
    app: './js/server.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/server.js',
  },
};
