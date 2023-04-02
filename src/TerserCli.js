#!/usr/bin/env node

const meow = require("meow");
const terserDir = require("./TerserDir");

const cli = meow({
  help: [
    "Usage: terser-dir <path> [options]",
    "",
    "Options:",
    "",
    "  --output, -o     Write the minified code to a file or directory",
    "  --each           Minify each file separately and output to a directory",
    "  --extension, -e  Specify the extension for the output file (default: .min.js)",
    "  --config-file, -c  Specify a configuration file for Terser",
    "  --comments, -C   Preserve comments in the output",
    "  --version, -v    Show version information",
    "  --help, -h       Show this help message",
    "",
    "Examples:",
    "",
    "  terser-dir src/js -o dist/js",
    "  terser-dir src/js -o dist/all.min.js",
    "  terser-dir src/js -o dist/js -e .prod.js",
    "  terser-dir src/js --each --output dist/js",
    "  terser-dir src/js --config-file terser.config.json",
    "  terser-dir src/js -C -o dist/js",
    "",
  ].join("\n"),
});

const path = cli.input[0];

if (!path) {
  console.error("No directory path provided.");
  cli.showHelp();
}

const options = {
  output: cli.flags.output || cli.flags.o || "",
  each: cli.flags.each || false,
  extension: cli.flags.extension || cli.flags.e || ".min.js",
  configFile: cli.flags.configFile || cli.flags.c || null,
  comments: cli.flags.comments || cli.flags.C || false,
};

if (cli.flags.version || cli.flags.v) {
  const { version } = require("./package.json");
  console.log(`terser-dir version ${version}`);
  process.exit(0);
}

terserDir(path, options);
