module.exports = {
  plugins: [
    require('postcss-custom-properties')({
      preserve: false // Remove the var() output entirely, only output static values
    })
  ]
};
