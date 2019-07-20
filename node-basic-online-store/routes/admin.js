const router = require('express').Router()
const {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
  getProducts,
} = require('../controllers/admin')
const isAuth = require('../middleware/isAuth')

// //////////////////////////////////////////////////////////////////////

router.get('/add-product', isAuth, getAddProduct)
router.post('/add-product', isAuth, postAddProduct)

router.get('/edit-product/:id', isAuth, getEditProduct)
router.post('/edit-product', isAuth, postEditProduct)

router.post('/delete-product', isAuth, postDeleteProduct)

router.get('/products', isAuth, getProducts)

module.exports = router
