// Metro applies babel-preset-expo implicitly without this file, but Jest
// doesn't go through Metro at all — it needs its own explicit config.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src'
          }
        }
      ]
    ]
  };
};
