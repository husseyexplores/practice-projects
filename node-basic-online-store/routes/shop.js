const router = require('express').Router()
const {
  getProducts,
  getProduct,
  getIndex,
  getCart,
  postCart,
  postDeleteCartItem,
  getOrders,
  postOrder,
  getInvoice,
  getCheckout,
} = require('../controllers/shop')
const isAuth = require('../middleware/isAuth')
const { getOrderValidator } = require('../validators/shop')

// //////////////////////////////////////////////////////////////////////

router.get('/', getIndex)

router.get('/products', getProducts)
router.get('/products/:productId', getProduct)

router.get('/cart', isAuth, getCart)
router.post('/cart', isAuth, postCart)
router.post('/cart-delete-item', isAuth, postDeleteCartItem)

router.get('/orders', isAuth, getOrders)
router.post('/create-order', isAuth, postOrder)
router.get('/orders/:orderId', [isAuth, getOrderValidator], getInvoice)

router.get('/checkout', isAuth, getCheckout)

module.exports = router
