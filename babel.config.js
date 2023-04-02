module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  ignore: ['node_modules'],
  include: ['./src/**/**.js', 'node_modules/globby/**/**.js'], // add globby to include
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-class-properties'
  ],
  sourceMaps: false,
};
