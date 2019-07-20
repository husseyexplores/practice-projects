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

// //////////////////////////////////////////////////////////////////////

router.get('/login', getLogin)
router.post('/login', postLogin)
router.post('/logout', postLogout)

router.get('/signup', getSignup)
router.post('/signup', postSignup)

router.get('/password-reset', getPasswordReset)
router.post('/password-reset', postPasswordReset)

router.get('/new-password/:resetToken', getNewPassword)
router.post('/new-password/:resetToken', postNewPassword)

module.exports = router
