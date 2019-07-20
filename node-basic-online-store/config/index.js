const NODE_ENV = process.env.NODE_ENV
  ? ['development', 'test', 'staging', 'production'].filter(
      v => v === process.env.NODE_ENV.toLowerCase()
    )[0] || 'development'
  : 'development'

const config = {
  development: {
    DB_URI: process.env.DEV_DB_URI,
  },
  test: {
    DB_URI: process.env.TEST_DB_URI,
  },
  staging: {
    DB_URI: process.env.DEV_DB_URI,
  },
  production: {
    DB_URI: process.env.DB_URI,
  },
}

module.exports = { ...config[NODE_ENV], NODE_ENV }
