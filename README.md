# terser-dir

<img src="https://terser.org/img/terser-banner-logo.png" alt="Terser" width="400">

Run `terser` on a folder, minify the results into a file/folder.

## Getting Started

Install the module with: `npm install terser-dir -g`

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