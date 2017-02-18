const through = require('through2');
const path = require('path');
const gulpUtil = require('gulp-util');
const fs = require('fs');

const PLUGIN_NAME = 'gulp-rev-update';

const readManifestFile = (manifestFile) => {
  let objManifestContent = null;

  if (!manifestFile) {
    throw new gulpUtil.PluginError(PLUGIN_NAME, 'ManifestFile not specified!');
  }

  try {
    objManifestContent = fs.readFileSync(manifestFile, 'utf8');
    return JSON.parse(objManifestContent);
  } catch (err) {
    throw new gulpUtil.PluginError(PLUGIN_NAME, err);
  }
};

const getFileName = (filePath) => {
  const fileName = filePath.replace(/^.*[\\/]/, '');
  return fileName;
};

const prepareRegexp = (fileName) => {
  let fileExtension = path.extname(fileName);
  fileExtension = fileExtension.replace('.', ''); // remove dot from the file extenstion
  const name = fileName.replace(fileExtension, '');
  const rootFilename = name.substr(0, name.indexOf('.'));
  const revedFileRegPattern = `((${rootFilename})((-)?[0-9a-f]{8,10})?(.*([.]{1})${fileExtension}))`;

  return revedFileRegPattern;
};

const cachefileRenames = (fileNames, originalFileName, revedFileName) => {
  fileNames.push({
    origin: originalFileName,
    reved: revedFileName,
    pattern: prepareRegexp(originalFileName),
  });
};

const plugin = (options) => {
  const fileNames = [];
  const cachedFiles = [];
  let opt = options;

  opt = opt || {};
  opt.replaceInExtensions = opt.replaceInExtensions || ['.css', '.html', '.hbs', '.php', '.twig', '.htm'];
  if (typeof opt.replaceReved === 'undefined') {
    opt.replaceReved = true;
  }

  const updateFilesContent = (stream) => {
    cachedFiles.forEach((file) => {
      const fileTmp = file;
      let contents = file.contents.toString();

      fileNames.forEach((rename) => {
        if (opt.replaceReved) {
          const reg = new RegExp(rename.pattern, 'g');
          contents = contents.replace(reg, rename.reved);
        } else {
          contents = contents.split(rename.origin).join(rename.reved);
        }
      });

      fileTmp.contents = new Buffer(contents);
      stream.push(fileTmp);
    });
  };

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      cb(new gulpUtil.PluginError(PLUGIN_NAME, 'Streams not supported!'));
      return false;
    }

    if (file.revOrigPath) {
      cachefileRenames(fileNames, getFileName(file.revOrigPath), getFileName(file.path));
    }

    if (opt.replaceInExtensions.indexOf(path.extname(file.path)) > -1) {
      cachedFiles.push(file);
    } else {
      this.emit('error', new gulpUtil.PluginError(PLUGIN_NAME,
        `Unacceptable file extension: ${path.extname(file.path)} / use: replaceInExtensions option parameter`));
    }

    cb();
  }, function (cb) {
    const stream = this;

    if (opt.manifestFile) {
      const jsonManifest = readManifestFile(opt.manifestFile);

      Object.keys(jsonManifest).forEach((srcFile) => {
        cachefileRenames(fileNames, srcFile, jsonManifest[srcFile]);
      });
      updateFilesContent(stream);
    } else {
      this.emit('error', new gulpUtil.PluginError(PLUGIN_NAME, 'Manifest file not specified'));
    }

    cb();
  });
};

module.exports = plugin;
