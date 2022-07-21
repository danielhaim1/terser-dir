#! /usr/bin/env node

"use strict";

const meow = require("meow");
const dir = require("./");

const cli = meow({
  help: [
    "Usage:    terser-dir <path> <options>",
    " ",
    "--output  Specify a file/folder to write the minified code",
    "--help    Print this list and exit.",
    " ",
    "Example:  terser-dir src/js --output bundle/",
    "Example:  terser-dir src/js --output bundle/all.min.js",
    " "
  ].join("\n")
});

const result = dir(cli.input[0], {
  output: cli.flags.output || cli.flags.o,
  extension: cli.flags.extension || ".min.js",
  each: cli.flags.each || false,
  es6: cli.flags.harmony || false,
  patterns: (cli.flags.pattern || cli.flags.p || "**/*.js").split(cli.flags.pseparator || ",")
});

if (result) {
  console.log(result);
}