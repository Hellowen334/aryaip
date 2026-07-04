module.exports = {
  sourceType: 'module',
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '38' // gerçek test cihazın: 49UH770V / webOS 3.0 / Chromium 38
        }
      }
    ],
    '@babel/preset-react'
  ],
  plugins: [
    ['polyfill-corejs3', { method: 'usage-global' }]
  ]
};