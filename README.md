# terser-dir

<img src="https://terser.org/img/terser-banner-logo.png" alt="Terser" width="400">

Command to run `terser` on a folder and minify the result in a single file or a new folder.

## Getting Started

Install the module with: `npm i terser-dir`

## Documentation

### Usage

```
terser-dir path [options]
```

```shell
--output  Specify a file/folder to write the minified code
--help    Print this list and exit.
```

### Examples

```shell
$ terser-dir src/js --output bundle/
$ terser-dir src/js --output bundle/all.min.js
```