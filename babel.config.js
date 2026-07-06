module.exports = {
  sourceType: 'module',
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '38' // gerçek test cihazın: 49UH770V / webOS 3.0 / Chromium 38
        },
        useBuiltIns: 'usage',
        corejs: 3
      }
    ],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};