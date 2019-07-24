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
const { productImageHandler } = require('../middleware/multer')
const {
  addProductValidators,
  editProductValidators,
  productShouldContainImg,
} = require('../validators/admin')

// //////////////////////////////////////////////////////////////////////

router.get('/add-product', isAuth, getAddProduct)
router.post(
  '/add-product',
  [isAuth, productImageHandler, addProductValidators, productShouldContainImg],
  postAddProduct
)

router.get('/edit-product/:id', isAuth, getEditProduct)
router.post(
  '/edit-product',
  [isAuth, productImageHandler, editProductValidators],
  postEditProduct
)

router.post('/delete-product', isAuth, postDeleteProduct)

router.get('/products', isAuth, getProducts)

module.exports = router
