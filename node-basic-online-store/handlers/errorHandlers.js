/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchAsyncErr(), catch and errors they throw, and pass it along to our express middleware with next()
*/

exports.catchAsyncErr = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
exports.notFound = (req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  err.pageTitle = 'Not Found'
  next(err)
}

/*
  MongoDB Validation Error Handler

  Detect if there are mongodb validation errors that we can nicely show via flash messages
*/

exports.flashValidationErrors = (err, req, res, next) => {
  if (!Array.isArray(err.errors)) return next(err)

  req.flash('error', err.errors)
  res.redirect('back')
}

/*
  Development Error Hanlder

  In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || ''
  const status = err.status || 500
  res.status(status)

  const errorDetails = {
    pageTitle: err.pageTitle || 'Unexpected Server Error',
    message: err.message,
    reason: err.reason,
    status,
    stackHighlighted:
      status !== 404 &&
      err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
  }

  res.format({
    // Based on the `Accept` http header
    'text/html': () => {
      res.render('error', errorDetails)
    }, // Form Submit, Reload the page
    'application/json': () => res.json(errorDetails), // Ajax call, send JSON back
  })
}

/*
  Production Error Handler

  No stacktraces are leaked to user
*/
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500)
  if (err.status === 404) {
    return res.render('error', {
      pageTitle: 'Not Found',
      message: 'No resource found at this route.',
      reason: err.reason,
      error: {},
    })
  }

  res.render('error', {
    pageTitle: err.pageTitle || 'Unexpected Server Error',
    message: err.message,
    reason: err.reason,
    error: {},
  })
}
