terser-dir
==========

<img src="https://terser.org/img/terser-banner-logo.svg" alt="Terser" style="width: 150px; height: auto;">

[![npm version](https://img.shields.io/npm/v/terser-dir)](https://www.npmjs.com/package/terser-dir)
[![Downloads](https://img.shields.io/npm/dt/terser-dir.svg)](https://www.npmjs.com/package/terser-dir)
![GitHub](https://img.shields.io/github/license/danielhaim1/terser-dir)

Command to run `terser` on a folder and minify the result in a single file or a new folder.

Getting Started
---------------

Install the module with: `npm i terser-dir`

Documentation
-------------

### Usage
```shell
terser-dir      path [options]

--output        Specify a file/folder to write the minified code
--config-file   Specify a configuration file for Terser
--help          Print this list and exit.
```

### Examples
```shell
$ terser-dir src/js --output .bundle/
$ terser-dir src/js --output .bundle/all.min.js
$ terser-dir demo/files --config-file demo/config.json
$ terser-dir demo/files --output app-test-noconfig.min.js
```

### Configuration Options

You can also specify a configuration file in JSON format. The configuration file can define input files, output paths, and debugging options.

```json
{
  "input": [
    "demo/files/file1.js",
    "demo/files/dir1/file2.js"
  ],
  "output": "dist/app-test-config.min.js",
  "debug": true
}
```

### Output Files

The output file can be customized, for example:

*   `app-test-config.min.js` - when using a configuration file.
*   `app-test-noconfig.min.js` - when specifying input files directly.
