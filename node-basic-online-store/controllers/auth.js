const { hash, compare } = require('bcryptjs')
const User = require('../models/User')
const { catchAsyncErr } = require('../handlers/errorHandlers')
const { mailer, createRandomToken } = require('../utils/helpers')

// //////////////////////////////////////////////////////////////////////

exports.getSignup = (req, res) => {
  res.render('shop/signup', {
    pageTitle: 'Signup',
    path: '/signup',
  })
}

exports.postSignup = catchAsyncErr(async (req, res) => {
  let hasErr = false
  const { email, password, confirmPassword } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    req.flash(
      'error',
      `User with email ${email} already exist. Please use a different email`
    )
    hasErr = true
  }

  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match')
    hasErr = true
  }

  if (hasErr) return res.redirect('/signup')

  const hashedPassword = await hash(password, 12)

  const newUser = new User({
    email,
    password: hashedPassword,
    cart: { items: [] },
  })

  await newUser.save()
  res.redirect('/login')

  /*
  // Send mail
  const emailObj = {
    to: email,
    from: 'husseyexplores.com',
    subject: 'Welcome to dummy node project!',
    html: '<strong>Thanks for signing up :)</strong>',
  }

  mailer.sendMail(emailObj)
  */
})

exports.getLogin = (req, res) => {
  res.render('shop/login', {
    pageTitle: 'Login',
    path: '/login',
  })
}

exports.postLogin = catchAsyncErr(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  let pwMatched = false

  if (user) {
    pwMatched = await compare(password, user.password)
  }

  if (!user || !pwMatched) {
    req.flash('error', 'Invalid email or password')
    return res.redirect('/login')
  }

  req.session.isAuthenticated = true // Shared accross multiple requests
  req.session.user = user
  req.session.save(() => {
    res.redirect('/')
  })
})

exports.postLogout = catchAsyncErr(async (req, res) => {
  req.session.destroy(err => {
    res.redirect('/login')
  })
})

exports.getPasswordReset = (req, res) => {
  res.render('shop/password-reset', {
    pageTitle: 'Password Reset',
    path: '/password-reset',
  })
}

exports.postPasswordReset = catchAsyncErr(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    req.flash('error', `User with email ${email} does not exist`)
    return res.redirect('/password-reset')
  }

  const token = await createRandomToken()

  user.resetToken = token
  user.resetTokenExpiry = Date.now() + 1000 * 60 * 60 // 1 hour from now
  await user.save()

  mailer.sendMail({
    to: email,
    from: 'husseyexplores.com',
    subject: 'Password reset - Node Dummy Project',
    html: `
      <p>You requested a password reset</p>
      <p><a href="http://localhost:3000/new-password/${token}">Click here to set a new password</a></p>
    `,
  })

  req.flash('info', 'Please check your email to reset your password')
  res.redirect('/')
})

exports.getNewPassword = catchAsyncErr(async (req, res) => {
  const { resetToken } = req.params

  const user = await User.findOne({
    resetToken,
    resetTokenExpiry: { $gt: Date.now() },
  })

  if (!user) {
    req.flash('error', 'Invalid token or the token is expired.')
    return res.redirect('/password-reset')
  }

  res.render('shop/new-password', {
    pageTitle: 'New Password',
    path: '/new-password',
    email: user.email,
    resetToken,
  })
})

exports.postNewPassword = catchAsyncErr(async (req, res) => {
  const { resetToken } = req.params
  const { email, password, confirmPassword } = req.body

  const user = await User.findOne({
    email,
    resetToken,
    resetTokenExpiry: { $gt: Date.now() },
  })

  if (!user) {
    req.flash(
      'error',
      `User with email ${email} does not exist or the token is already expired`
    )
    return res.redirect('/password-reset')
  }

  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match')
    return res.redirect(`/new-password/${resetToken}`)
  }

  const hashedPassword = await hash(password, 12)
  user.password = hashedPassword
  user.resetToken = null
  user.resetTokenExpiry = undefined
  await user.save()

  req.flash('success', 'Password successfully updated')
  res.redirect('/login')
})
