const TerserDir = require('./terser.dir.js');
const path = require('path');

class TerserCli {
  constructor() {}

  async run() {
    const args = process.argv.slice(2);
    const options = this.parseArguments(args);

    if (!options.output) {
      options.output = '_out_';
    }

    if (options.version) {
      const { version } = require("./package.json");
      console.log(`terser-dir version ${version}`);
      return;
    }

    if (options.help || !args[0]) {
      console.log("Usage: terser-dir <path> [options]");
      console.log("\nOptions:");
      console.log("  --output, -o     Write the minified code to a file or directory");
      console.log("  --each           Minify each file separately and output to a directory");
      console.log("  --extension, -e  Specify the extension for the output file (default: .min.js)");
      console.log("  --config-file, -c  Specify a configuration file for Terser");
      console.log("  --comments, -C   Preserve comments in the output");
      console.log("  --version, -v    Show version information");
      console.log("  --help, -h       Show this help message");
      return;
    }

    try {
      const targetDirectory = path.resolve(args[0]);
      const terserDir = new TerserDir();
      const javascriptFiles = await terserDir.findJavaScriptFiles(targetDirectory);
      await terserDir.terserDir(javascriptFiles, options);
      console.log(`Minification completed for directory: ${targetDirectory}`);
    } catch (error) {
      console.error(`Error occurred: ${error.message}`);
      process.exit(1);
    }
  }

  parseArguments(args) {
    const options = {
      output: '_out_', // Default output directory
      each: false,
      extension: '.min.js',
      configFile: null,
      comments: false,
      version: false,
      help: false
    };

    args.forEach((arg, index) => {
      switch(arg) {
        case '--output':
        case '-o':
          options.output = args[index + 1];
          break;
        case '--each':
          options.each = true;
          break;
        case '--extension':
        case '-e':
          options.extension = args[index + 1];
          break;
        case '--config-file':
        case '-c':
          options.configFile = args[index + 1];
          break;
        case '--comments':
        case '-C':
          options.comments = true;
          break;
        case '--version':
        case '-v':
          options.version = true;
          break;
        case '--help':
        case '-h':
          options.help = true;
          break;
      }
    });

    return options;
  }
}

module.exports = TerserCli;
