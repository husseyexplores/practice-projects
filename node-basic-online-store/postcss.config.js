const { NODE_ENV } = require('./config')

/* eslint-disable global-require */
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    (process.env.NODE_ENV || NODE_ENV) === 'production' &&
      require('@fullhuman/postcss-purgecss')({
        content: ['.views/**/*.pug', '.views/**/*.html'],
        defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
      }),
  ],
}
