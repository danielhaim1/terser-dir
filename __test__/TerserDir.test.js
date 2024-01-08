const fs = require('fs').promises;
const path = require('path');
const terserDir = require('../src/terser.dir.js');

jest.mock('fs', () => {
  return {
    promises: {
      readdir: jest.fn((directory, options) => {
        if (directory.includes('dir1')) {
          return Promise.resolve([{ name: 'file2.js', isDirectory: () => false, isFile: () => true }]);
        } else {
          return Promise.resolve([
            { name: 'file1.js', isDirectory: () => false, isFile: () => true },
            { name: 'dir1', isDirectory: () => true, isFile: () => false },
            { name: 'file3.txt', isDirectory: () => false, isFile: () => true }
          ]);
        }
      }),
      readFile: jest.fn().mockResolvedValue('console.log("test");'),
      writeFile: jest.fn().mockResolvedValue(),
      mkdir: jest.fn().mockResolvedValue(),
    },
  };
});

describe('terserDir', () => {
  it('should process files without errors', async () => {
    await terserDir(path.join(__dirname, 'fixtures'));

    expect(fs.readdir).toHaveBeenCalled();
    expect(fs.readFile).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

});