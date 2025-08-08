const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the Babel loader rule
      const oneOfRule = webpackConfig.module.rules.find((rule) => Array.isArray(rule.oneOf)).oneOf;

      // Include @react-leaflet/core and react-leaflet for Babel transpilation
      const babelLoader = oneOfRule.find(
        (rule) =>
          rule.loader &&
          rule.loader.includes('babel-loader') &&
          rule.include
      );

      if (babelLoader) {
        if (Array.isArray(babelLoader.include)) {
          babelLoader.include.push(path.resolve('node_modules/@react-leaflet/core'));
          babelLoader.include.push(path.resolve('node_modules/react-leaflet'));
        } else {
          babelLoader.include = [
            babelLoader.include,
            path.resolve('node_modules/@react-leaflet/core'),
            path.resolve('node_modules/react-leaflet')
          ];
        }
      }

      return webpackConfig;
    },
  },
};
