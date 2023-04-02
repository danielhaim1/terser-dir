const path = require("path");
const extend = require("extend");
const fs = require("fs").promises;
const mkdirp = require("mkdirp");
const terser = require("terser");
const globby = require('globby');

const defaultOptions = {
  comments: false,
  output: '',
  each: false,
  extension: '.min.js',
  patterns: ['**/*.js'],
  configFile: null,
};

async function terserDir(dirPath, options = {}) {
  const mergedOptions = extend(true, {}, defaultOptions, options);

  const uglifyConfiguration = mergedOptions.configFile ? require(path.resolve(mergedOptions.configFile)) : {};

  const files = await globby(mergedOptions.patterns, { cwd: dirPath });

  if (mergedOptions.each) {
    for (const fileName of files) {
      const outputDir = mergedOptions.output || '_out_';
      const newName = path.join(outputDir, path.dirname(fileName), `${path.basename(fileName, path.extname(fileName))}${mergedOptions.extension}`);

      const originalCode = {};
      originalCode[fileName] = await readFile(path.join(dirPath, fileName));

      const minifyResult = terser.minify(originalCode, getUglifyOptions(newName, uglifyConfiguration));

      if (minifyResult.error) {
        console.error(`Error minifying ${fileName}: ${minifyResult.error}`);
        process.exit(1);
      }

      await writeFile(newName, minifyResult.code);

      if (minifyResult.map) {
        await writeFile(`${newName}.map`, minifyResult.map);
      }
    }
  } else {
    const originalCode = {};

    for (const fileName of files) {
      let source = await readFile(path.join(dirPath, fileName));

      if (mergedOptions.comments) {
        source = `/**** ${fileName} ****/\n${source}`;
      }

      originalCode[fileName] = source;
    }

    const uglifyOptions = getUglifyOptions(mergedOptions.output, uglifyConfiguration);

    if (mergedOptions.comments) {
      uglifyOptions.output = uglifyOptions.output || {};
      uglifyOptions.output.comments = uglifyOptions.output.comments || '/\\*{2}/';
    }

    const minifyResult = terser.minify(originalCode, uglifyOptions);

    if (minifyResult.error) {
      console.error(`Error minifying code: ${minifyResult.error}`);
      process.exit(1);
    }

    if (!mergedOptions.output) {
      return minifyResult.code;
    } else {
      await writeFile(mergedOptions.output, minifyResult.code);

      if (minifyResult.map) {
        await writeFile(`${mergedOptions.output}.map`, minifyResult.map);
      }
    }
  }
}

function getUglifyOptions(filePath, uglifyConfiguration) {
  const { name: fileName, ext: fileExtension } = path.parse(filePath);

  const uglifyOptions = JSON.parse(JSON.stringify(uglifyConfiguration));

  if (uglifyOptions.sourceMap?.filename) {
    uglifyOptions.sourceMap.filename = uglifyOptions.sourceMap.filename.replace('{file}', fileName);
  }

  if (uglifyOptions.sourceMap?.url) {
    uglifyOptions.sourceMap.url = uglifyOptions.sourceMap.url.replace('{file}', fileName);
  }

  return uglifyOptions;
}

async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (e) {
    console.error(`Error reading file: ${e}`);
    process.exit(1);
  }
}

async function writeFile(filePath, code) {
  const { dir: dirPath } = path.parse(filePath);
  await mkdirp(dirPath);
  try {
    await fs.writeFile(filePath, code);
    console.log(`File ${filePath} written successfully.`);
  } catch (err) {
    console.error(`Error writing file: ${err}`);
    process.exit(1);
  }
}

module.exports = terserDir;

