const router = require('express').Router()
const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getPasswordReset,
  postPasswordReset,
  getNewPassword,
  postNewPassword,
} = require('../controllers/auth')
const {
  signUpUserValidators,
  loginUserValidators,
} = require('../validators/auth')

// //////////////////////////////////////////////////////////////////////

router.get('/login', getLogin)
router.post('/login', loginUserValidators, postLogin)
router.post('/logout', postLogout)

router.get('/signup', getSignup)
router.post('/signup', signUpUserValidators, postSignup)

router.get('/password-reset', getPasswordReset)
router.post('/password-reset', postPasswordReset)

router.get('/new-password/:resetToken', getNewPassword)
router.post('/new-password/:resetToken', postNewPassword)

module.exports = router
