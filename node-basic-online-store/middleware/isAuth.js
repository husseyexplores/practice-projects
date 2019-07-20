const { catchAsyncErr } = require('../handlers/errorHandlers')

module.exports = catchAsyncErr(async (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next()
  }

  res.redirect('/login')
})
