/* eslint strict: 0 */

'use strict';

const path = require('path');
const assert = require('assert');
const gutil = require('gulp-util');
const filter = require('gulp-filter');

const updateRev = require('./');

const htmlFile = '<html><head></script><link rel="stylesheet" href="/css/style.css" /><script src="/scripts/main.min.js"><script src="/scripts/vendor.min.js"></head><body><img src="images/image.png" /></body></html>';
const htmlFileWithReved = '<html><head></script><link rel="stylesheet" href="/css/style-d21d2dd282.css" /><script src="/scripts/main-ef1d2dd9ae.min.js"></head><body><img src="images/image-e11d2fd555.png" /></body></html>';
const cssFile = '@font-face { font-family: \'test\'; src: url(\'/fonts/font.svg\'); } body { color: red; }';

const manifestFilePath = './test.manifest-fixture.json';

describe('Update occurences using test.manifest-fixture.json file', () => {
  it('Should replace unreved filenames in .css file', (cb) => {
    const filesToRevison = filter(['**/*.css'], { restore: true });

    const stream = filesToRevison
      .pipe(updateRev({ manifestFile: manifestFilePath }));

    let fileCount = 0;
    const unreplacedSVGFilePattern = /font\.svg/;

    stream.on('data', (file) => {
      const contents = file.contents.toString();
      const extension = path.extname(file.path);

      if (extension === '.css') {
        assert(!unreplacedSVGFilePattern.test(contents), 'The renamed SVG file\'s name should be replaced');
      }

      fileCount++;
    });
    stream.on('end', () => {
      assert.equal(fileCount, 1, 'Only one file should pass through the stream');
      cb();
    });

    filesToRevison.write(new gutil.File({
      path: path.join('css', 'style.css'),
      contents: new Buffer(cssFile),
    }));

    filesToRevison.end();
  });

  it('Should replace unreved filenames in .html file', (cb) => {
    const filesToRevison = filter(['**/*.html'], { restore: true });

    const stream = filesToRevison
      .pipe(updateRev({ manifestFile: manifestFilePath }));

    const unreplacedCSSFilePattern = /style\.css/;
    const unreplacedJSFilePattern = /main\.min\.js/;
    const unreplacedPNGFilePattern = /image\.png/;

    stream.on('data', (file) => {
      const contents = file.contents.toString();
      const extension = path.extname(file.path);

      if (extension === '.html') {
        assert(!unreplacedCSSFilePattern.test(contents), 'The renamed CSS file\'s name should be replaced');
        assert(!unreplacedJSFilePattern.test(contents), 'The renamed JS file\'s name should be replaced');
        assert(!unreplacedPNGFilePattern.test(contents), 'The renamed PNG file\'s name should be replaced');
      }
    });
    stream.on('end', () => {
      cb();
    });

    filesToRevison.write(new gutil.File({
      path: 'index.html',
      contents: new Buffer(htmlFile),
    }));

    filesToRevison.end();
  });

  it('Should replace reved filenames in .html file', (cb) => {
    const filesToRevison = filter(['**/*.html'], { restore: true });

    const stream = filesToRevison
      .pipe(updateRev({ manifestFile: manifestFilePath }));

    const unreplacedCSSFilePattern = /style-d21d2dd282\.css/;
    const unreplacedJSFilePattern = /main-ef1d2dd9ae\.min\.js/;
    const unreplacedPNGFilePattern = /image-e11d2fd555\.png/;

    stream.on('data', (file) => {
      const contents = file.contents.toString();
      const extension = path.extname(file.path);

      if (extension === '.html') {
        assert(!unreplacedCSSFilePattern.test(contents), 'The renamed CSS file\'s name should be replaced');
        assert(!unreplacedJSFilePattern.test(contents), 'The renamed JS file\'s name should be replaced');
        assert(!unreplacedPNGFilePattern.test(contents), 'The renamed PNG file\'s name should be replaced');
      }
    });
    stream.on('end', () => {
      cb();
    });

    filesToRevison.write(new gutil.File({
      path: 'index.html',
      contents: new Buffer(htmlFileWithReved),
    }));

    filesToRevison.end();
  });

  it('Should not replace reved filenames in .html file', (cb) => {
    const filesToRevison = filter(['**/*.html'], { restore: true });

    const stream = filesToRevison
      .pipe(updateRev({ manifestFile: manifestFilePath, replaceReved: false }));

    const unreplacedCSSFilePattern = /style-d21d2dd282\.css/;
    const unreplacedJSFilePattern = /main-ef1d2dd9ae\.min\.js/;
    const unreplacedPNGFilePattern = /image-e11d2fd555\.png/;

    stream.on('data', (file) => {
      const contents = file.contents.toString();
      const extension = path.extname(file.path);

      if (extension === '.html') {
        assert(unreplacedCSSFilePattern.test(contents), 'The renamed CSS file\'s name should not be replaced');
        assert(unreplacedJSFilePattern.test(contents), 'The renamed JS file\'s name should not be replaced');
        assert(unreplacedPNGFilePattern.test(contents), 'The renamed PNG file\'s name should not be replaced');
      }
    });
    stream.on('end', () => {
      cb();
    });

    filesToRevison.write(new gutil.File({
      path: 'index.html',
      contents: new Buffer(htmlFileWithReved),
    }));

    filesToRevison.end();
  });
});
