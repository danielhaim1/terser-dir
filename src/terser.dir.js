const fs = require('fs').promises;
const path = require('path');
const terser = require('terser');

class TerserDirectory {
  constructor() {
    this.defaultOptions = {
      comments: false,
      output: '',
      each: false,
      extension: '.min.js',
      patterns: ['**/*.js'],
      configFile: null,
    };
  }

  async findJavaScriptFiles(directory, patterns = ['.js']) {
    let results = [];

    async function readDirectory(dir) {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          await readDirectory(fullPath);
        } else if (item.isFile() && patterns.some(ext => item.name.endsWith(ext))) {
          results.push(fullPath);
        }
      }
    }

    await readDirectory(directory);
    return results;
  }

async processJavaScriptFile(filePath, options, uglifyConfig) {
  try {
    const originalCode = await this.readFile(filePath);

    console.log('Debug Original Code:');
    console.log(originalCode);

    const minifyResult = await terser.minify(originalCode, this.getUglifyOptions(filePath, uglifyConfig));
    
    console.log('Debug Minify Result:');
    console.log(minifyResult);

    if (minifyResult.error) {
      throw new Error(`Error minifying ${filePath}: ${minifyResult.error}`);
    }

    await this.writeMinifiedJavaScriptFile(filePath, minifyResult, options);
  } catch (error) {
    console.error(`Error processing JavaScript file: ${error.message}`);
  }
}



  async terserDirectory(files, options = {}) {
    options.each = options.each || this.defaultOptions.each; // Ensure options.each is defined
    let uglifyConfig = {};
    if (options.configFile) {
      const configFileFullPath = path.resolve(options.configFile);
      if (await fs.access(configFileFullPath).catch(() => false)) {
        uglifyConfig = require(configFileFullPath);
      } else {
        console.error(`Configuration file not found: ${configFileFullPath}`);
        throw new Error("Configuration file not found");
      }
    }

    const originalCode = {};
    for (const filePath of files) {
      originalCode[filePath] = await this.readFile(filePath);
    }

    const minifyResult = terser.minify(originalCode, this.getUglifyOptions(options.output, uglifyConfig));
    if (minifyResult.error) throw new Error(`Error minifying: ${minifyResult.error}`);

    await this.writeMinifiedJavaScriptFile(options.output, minifyResult, options);
  }

getOutputJavaScriptFilePath(fileName, options) {
  if (options.each) {
    const outputDir = options.output || './dist/';
    if (outputDir === '') {
      console.error('Error: Invalid output directory.');
      return null;
    }
    return path.join(outputDir, `${path.basename(fileName, path.extname(fileName))}${options.extension}`);
  }
  return options.output;
}
async writeMinifiedJavaScriptFile(filePath, minifyResult, options) {
  const outputDir = options.output || './dist/';
  const fileName = path.basename(filePath, path.extname(filePath));
  const outputFilePath = path.join(outputDir, `${fileName}${options.extension}`);
  console.log('Debug Output:');
  console.log('outputFilePath:', outputFilePath);
  console.log('outputDir:', outputDir);
  console.log('minifyResult:', minifyResult);

  try {
    await fs.access(outputDir);
  } catch (err) {
    await fs.mkdir(outputDir, { recursive: true });
  }

  if (!minifyResult || minifyResult.error) {
    console.error(`Error minifying ${filePath}: ${minifyResult ? minifyResult.error : 'Unknown error'}`);
    return; // Don't proceed with writing the file if there's an error
  }

  if (typeof minifyResult.code === 'string') {
    await fs.writeFile(outputFilePath, minifyResult.code);
    if (minifyResult.map) {
      await fs.writeFile(`${outputFilePath}.map`, minifyResult.map);
    }
  } else {
    console.error('Error: Invalid data provided for writing the file.');
  }
}



  getUglifyOptions(filePath, uglifyConfiguration) {
    const { name: fileName, ext: fileExtension } = path.parse(filePath);

    const uglifyOptions = { ...uglifyConfiguration };

    if (uglifyOptions.sourceMap?.filename) {
      uglifyOptions.sourceMap.filename = uglifyOptions.sourceMap.filename.replace('{file}', fileName);
    }

    if (uglifyOptions.sourceMap?.url) {
      uglifyOptions.sourceMap.url = uglifyOptions.sourceMap.url.replace('{file}', fileName);
    }

    return uglifyOptions;
  }

  async readFile(filePath) {
    return await fs.readFile(filePath, 'utf-8');
  }

  async writeFile(filePath, code) {
    const { dir: dirPath } = path.parse(filePath);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, code);
  }
}

module.exports = TerserDirectory;
