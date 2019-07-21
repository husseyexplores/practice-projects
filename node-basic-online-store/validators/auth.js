const { body } = require('express-validator')
const User = require('../models/User')

// //////////////////////////////////////////////////////////////////////

exports.signUpUserValidators = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid E-mail address')
    .normalizeEmail(),
  body('email').custom(email =>
    User.findOne({ email }).then(user => {
      if (user) {
        return Promise.reject('E-mail already in use')
      }
    })
  ),
  body(
    'password',
    'Password must be at least 6 characters long and should consists of alphanumeric characters'
  )
    .isLength({ min: 6 })
    .isAlphanumeric(),
  body('password').custom((value, { req }) => {
    if (value !== req.body.confirmPassword) {
      throw new Error('Password confirmation is incorrect')
    }
    return true
  }),
]

exports.loginUserValidators = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid E-mail address')
    .normalizeEmail(),
  body('password')
    .exists()
    .withMessage('Password is missing'),
]
