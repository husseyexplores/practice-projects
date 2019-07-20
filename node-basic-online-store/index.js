require('dotenv').config()
const mongoose = require('mongoose')
const { DB_URI } = require('./config')
const app = require('./app')

// ///////////////////////////////////////////////////////////////////////

mongoose
  .connect(DB_URI, { useNewUrlParser: true })
  .then(() => {
    app.listen(3000, () => {
      console.log('App Started on port 3000')
    })
  })
  .catch(console.log)
