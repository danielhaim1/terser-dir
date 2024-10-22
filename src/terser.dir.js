const fs = require('fs').promises;
const path = require('path');
const terser = require('terser');

class TerserDirectory {
    constructor () {
        this.defaultOptions = {
            comments: false,
            output: './dist/app.js',
            each: false,
            extension: '.js',
            patterns: ['**/*.js'],
            configFile: null,
        };
    }
    
    async readConfigFile(configFilePath) {
        try {
            const configData = await fs.readFile(configFilePath, 'utf-8');
            return JSON.parse(configData);
        } catch (error) {
            console.error(`Error reading config file: ${error.message}`);
            throw error;
        }
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

            // Log the original code to verify what is being minified
            console.log(`Original code from ${filePath}:`);
            console.log(originalCode);

            const minifyResult = await terser.minify(originalCode, this.getUglifyOptions(filePath, uglifyConfig));

            if (minifyResult.error) {
                throw new Error(`Error minifying ${filePath}: ${minifyResult.error}`);
            }

            await this.writeMinifiedJavaScriptFile(filePath, minifyResult, options);
        } catch (error) {
            console.error(`Error processing JavaScript file: ${error.message}`);
            throw error; // Rethrow error for upstream handling
        }
    }

    async terserDirectory(files, options = {}) {
        // Check if config file is provided and read its content
        if (options.configFile) {
            const config = await this.readConfigFile(options.configFile);
            options = { ...options, ...config }; // Merge options with config
            files = config.input.map(file => path.resolve(__dirname, '../', file)); // Resolve input paths
            files = config.input.map(file => {
                const resolvedPath = path.resolve(__dirname, '../', file);
                console.log('Resolved input file path:', resolvedPath); // Debug log
                return resolvedPath;
            });

            options.output = path.resolve(__dirname, '../', config.output); // Resolve output path
        }

        try {
            // Only check for uglifyConfig if configFile was passed
            let uglifyConfig = {};
            // Ensure there are no references to config.json here
            // This section should focus on options passed from the config file

            // Concatenate all minified content
            let combinedMinifiedCode = '';

            for (const filePath of files) {
                const originalCode = await this.readFile(filePath);
                const minifyResult = await terser.minify(originalCode, this.getUglifyOptions(filePath, uglifyConfig));

                if (minifyResult.error) {
                    throw new Error(`Error minifying ${filePath}: ${minifyResult.error}`);
                }

                // Append the minified code to the combined result
                combinedMinifiedCode += minifyResult.code.trim(); // Strip newlines from individual results
            }

            // Write the concatenated minified code to the output file
            await this.writeMinifiedJavaScriptFile(options.output, { code: combinedMinifiedCode }, options);
        } catch (error) {
            console.error(`Error during minification process: ${error.message}`);
            throw error;
        }
    }

    getOutputJavaScriptFilePath(fileName, options) {
        const outputDir = options.output || this.defaultOptions.output;

        // If output is a directory (no file extension), handle it as a directory
        if (options.each || !path.extname(outputDir)) {
            return path.join(outputDir, `${path.basename(fileName, path.extname(fileName))}${options.extension}`);
        }

        // If output is a file, return that file path directly
        return outputDir;
    }

    async writeMinifiedJavaScriptFile(filePath, minifyResult, options) {
        const outputFilePath = this.getOutputJavaScriptFilePath(filePath, options);

        console.log('Debug: Writing to file:', outputFilePath);  // Add this line

        try {
            const outputDir = path.dirname(outputFilePath);
            await fs.mkdir(outputDir, { recursive: true });

            console.log('Debug: Directory created or exists:', outputDir);  // Add this line

            if (typeof minifyResult.code === 'string') {
                console.log('Debug: Minified code:', minifyResult.code);  // Add this line
                await fs.writeFile(outputFilePath, minifyResult.code);
            }
        } catch (err) {
            console.error(`Error writing minified file for ${filePath}: ${err.message}`);
            throw err;
        }
    }

    getUglifyOptions(filePath, uglifyConfiguration) {
        const { name: fileName } = path.parse(filePath);

        const uglifyOptions = {
            ...uglifyConfiguration
        };

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
        const {
            dir: dirPath
        } = path.parse(filePath);
        await fs.mkdir(dirPath, {
            recursive: true
        });
        await fs.writeFile(filePath, code);
    }
}

module.exports = TerserDirectory;