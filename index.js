let terser;

const globby = require("globby");
const path = require("path");
const extend = require("extend");
const fs = require("graceful-fs");
const mkdirp = require("mkdirp");

const defaultOptions = {
  comments: true,
  output: "",
  each: false,
  extension: ".min.js",
  patterns: ["**/*.js"],
  configFile: null
};

module.exports = (dirPath, options) => {
  options = extend({}, defaultOptions, options);

  const terser = require("terser");

  const uglifyConfiguration = options.configFile
    ? require(path.resolve(options.configFile))
    : {};

  // ! minify all *.js files
  const files = globby.sync(options.patterns, {
    cwd: dirPath
  });

  // ! minify files individually
  if (options.each) {
    files.forEach(fileName => {
      options.output = isEmpty(options.output) ? "_out_" : options.output;
      const newName =
        path.join(
          options.output,
          path.dirname(fileName),
          path.basename(fileName, path.extname(fileName))
        ) + options.extension;
      const originalCode = {};
      originalCode[fileName] = readFile(path.join(dirPath, fileName));
      const minifyResult = terser.minify(
        originalCode,
        getUglifyOptions(newName, uglifyConfiguration)
      );

      if (minifyResult.error) {
        console.log(minifyResult.error);
        throw minifyResult.error;
      }

      writeFile(newName, minifyResult.code);

      if (minifyResult.map) {
        writeFile(`${newName}.map`, minifyResult.map);
      }
    });
  } else {
    // ! bundle multiple files
    const originalCode = {};

    files.forEach(fileName => {
      let source = readFile(path.join(dirPath, fileName));

      if (options.comments) {
        source = `/**** ${fileName} ****/\n${source}`;
      }
      originalCode[fileName] = source;
    });

    const uglifyOptions = getUglifyOptions(options.output, uglifyConfiguration);

    if (options.comments) {
      uglifyOptions.output = uglifyOptions.output || {};
      uglifyOptions.output.comments =
        uglifyOptions.output.comments || "/\\*{2}/";
    }

    const minifyResult = terser.minify(originalCode, uglifyOptions);

    if (minifyResult.error) {
      console.log(minifyResult.error);
      throw minifyResult.error;
    }

    if (isEmpty(options.output)) {
      return minifyResult.code;
    } else {
      writeFile(options.output, minifyResult.code);

      if (minifyResult.map) {
        writeFile(`${options.output}.map`, minifyResult.map);
      }
    }
  }
};

// ! process terser options
function getUglifyOptions(fileName, uglifyConfiguration) {
  fileName = path.basename(fileName);
  const uglifyOptions = JSON.parse(JSON.stringify(uglifyConfiguration));

  if (uglifyOptions.sourceMap) {
    if (uglifyOptions.sourceMap.filename) {
      uglifyOptions.sourceMap.filename = uglifyOptions.sourceMap.filename.replace(
        "{file}",
        fileName
      );
    }

    if (uglifyOptions.sourceMap.url) {
      uglifyOptions.sourceMap.url = uglifyOptions.sourceMap.url.replace(
        "{file}",
        fileName
      );
    }
  }

  return uglifyOptions;
}

// ! check if the provided parameter is not an empty string.
function isEmpty(str) {
  if (typeof str != "string" || str.trim() == "") {
    return true;
  }
  return false;
}

function readFile(path) {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch (e) {
    console.error("terser FOLDER ERROR: ", path, "was not found !");
    return "";
  }
}

// ! write file in specified path
function writeFile(filePath, code) {
  mkdirp(path.dirname(filePath), () => {
    fs.writeFile(filePath, code, err => {
      if (err) {
        console.log(`Error: ${err}`);
        return;
      }
      console.log(`File ${filePath} written successfully.`);
    });
  });
}
