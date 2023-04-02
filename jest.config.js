module.exports = {
  transform: {
    '^.+\\.js$': 'esbuild-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(globby)/)',
  ],
};
