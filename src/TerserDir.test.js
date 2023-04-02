const terserDir = require('./TerserDir');

test('terserDir is defined', () => {
  expect(terserDir).toBeDefined();
});

test('terserDir does not throw an error', () => {
  expect(() => {
    terserDir('test/fixtures/file1.js', { output: 'test/output/file1.min.js' });
  }).not.toThrow();
});
