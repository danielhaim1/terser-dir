const fs = require('fs').promises;
const path = require('path');
const TerserDirectory = require('../src/terser.dir.js');

describe('TerserDirectory Integration Tests', () => {
    const outputDir = path.join(__dirname, '../dist/');
    const configFilePath = path.join(__dirname, '../demo/config-test.json'); // Path to the config file
    const noConfigOutputPath = path.join(outputDir, 'app-test-noconfig.min.js'); // Output for no config test
    const configOutputPath = path.join(outputDir, 'app-test-config.min.js'); // Output for config test

    beforeAll(async () => {
        // Ensure the output directory is clean before the test
        await fs.mkdir(outputDir, { recursive: true });
        // Clear previous content
        await fs.writeFile(noConfigOutputPath, ''); 
        await fs.writeFile(configOutputPath, ''); 
    });

    // afterAll(async () => {
    //     // Clean up the generated output files after the test
    //     await fs.unlink(noConfigOutputPath).catch(() => {});
    //     await fs.unlink(configOutputPath).catch(() => {});
    // });

    it('should read config file and minify files to app-test-config.min.js', async () => {
        const terserDirInstance = new TerserDirectory();

        // Define options for terser-dir with config file
        const options = {
            configFile: configFilePath,
            comments: false,
        };

        // Run the terserDirectory method to process files using the config
        await terserDirInstance.terserDirectory([], options);

        // Verify that the output file was created
        const outputFileExists = await fs.access(configOutputPath).then(() => true).catch(() => false);
        expect(outputFileExists).toBe(true);

        // Read the output file to verify its contents
        const outputContent = await fs.readFile(configOutputPath, 'utf-8');

        // Expected content based on the original files
        const expectedMinifiedContent = 'function hello(){console.log("Hello World")}function sum(n,u){return n+u}';
        expect(outputContent.trim()).toBe(expectedMinifiedContent);
    });

    it('should minify files without config and output to app-test-noconfig.min.js', async () => {
        const terserDirInstance = new TerserDirectory();

        // Define options for terser-dir without config file
        const options = {
            output: noConfigOutputPath,
            comments: false,
        };

        // Run the terserDirectory method to process files directly
        const inputFiles = [
            path.join(__dirname, '../demo/files/file1.js'),
            path.join(__dirname, '../demo/files/dir1/file2.js')
        ];
        await terserDirInstance.terserDirectory(inputFiles, options);

        // Verify that the output file was created
        const outputFileExists = await fs.access(noConfigOutputPath).then(() => true).catch(() => false);
        expect(outputFileExists).toBe(true);

        // Read the output file to verify its contents
        const outputContent = await fs.readFile(noConfigOutputPath, 'utf-8');

        // Expected content based on the original files
        const expectedMinifiedContent = 'function hello(){console.log("Hello World")}function sum(n,u){return n+u}';
        expect(outputContent.trim()).toBe(expectedMinifiedContent);
    });
});
