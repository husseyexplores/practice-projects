const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const session = require('express-session')
const csrf = require('csurf')
const MongoDBStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')

const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const errorHandlers = require('./handlers/errorHandlers')
const helpers = require('./utils/helpers')
const { NODE_ENV, DB_URI } = require('./config')
const User = require('./models/User')

// //////////////////////////////////////////////////////////////////////

const app = express()
const store = new MongoDBStore({ uri: DB_URI, collection: 'sessions' })
const csrfProtection = csrf()

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  session({
    secret: 'A very dumb secret value',
    resave: false,
    saveUninitialized: false,
    store,
  })
)
app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
  res.locals.h = res.locals.h || {}
  res.locals.h.dump = helpers.dump
  res.locals.csrfToken = req.csrfToken()
  res.locals.infoFlash = req.flash('info')
  res.locals.successFlash = req.flash('success')
  res.locals.warningFlash = req.flash('warning')
  res.locals.errorFlash = req.flash('error')

  const userId = req.session.user && req.session.user._id
  if (!userId) return next()

  User.findOne({ _id: userId })
    .then(user => {
      res.locals.isAuthenticated = req.session.isAuthenticated
      req.user = user
      next()
    })
    .catch(next)
})

app.use(authRoutes)
app.use('/admin', adminRoutes)
app.use(shopRoutes)

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound)

// One of our error handlers will see if these errors are just validation errors
// app.use(errorHandlers.flashValidationErrors)

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (NODE_ENV === 'production') {
  // production error handler
  app.use(errorHandlers.productionErrors)
} else {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors)
}

module.exports = app
