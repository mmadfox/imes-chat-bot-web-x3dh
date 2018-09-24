const webpack = require('webpack');
const config = require('./internal/webpack/web.config');
const UglifyJS = require('uglify-js');
const fs = require('fs');
const path = require('path');
// remove it
const fromFile = '/Users/xxx/imes/imes-cipher/web/dist/imeskeys.lib.min.js';
const toFile = '/Users/xxx/signal/public/imeskeys.lib.min.js';

function minify() {
  const signal = fs.readFileSync(path.resolve(__dirname, './web/src/libsignal-protocol.js'), 'utf8');
  const lib = fs.readFileSync(path.resolve(__dirname, './web/dist/imeskeys.lib.js'), 'utf8');

  // const signalMin = UglifyJS.minify(signal);
  // const libMin = UglifyJS.minify(lib);

  // if (signalMin.error) {
  // throw new Error(signalMin.error);
  // }
  // if (libMin.error) {
  // throw new Error(libMin.error);
  // }
  fs.writeFileSync(path.resolve(__dirname, './web/dist/imeskeys.lib.min.js'), `${signal}${lib}`);
}

function copyTo(fromFile, toFile) {
  try {
    fs.unlinkSync(toFile);
  } catch (e) {
    console.log('file not found');
  }
  fs.createReadStream(fromFile).pipe(fs.createWriteStream(toFile));
}

webpack(config, async (err, stats) => {
  if (err) {
    console.error(err);
  } else {
    minify();

    // sex :)
    const argv = process.argv.slice(2);
    if (argv[0] === '-x') {
      copyTo(fromFile, toFile);
    }
  }
});
