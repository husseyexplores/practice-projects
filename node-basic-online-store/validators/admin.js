const { body } = require('express-validator')
const Product = require('../models/Product')

// //////////////////////////////////////////////////////////////////////

exports.addProductValidators = [
  body(
    'title',
    'Product title should consisting of alphanumeric characters and should have a length between 3 to 50 characters'
  )
    .trim()
    .exists({ checkFalsy: true })
    .isString()
    .isLength({ min: 3, max: 50 }),
  body('description')
    .trim()
    .exists({ checkFalsy: true })
    .withMessage('Product description is missing'),
  // body('imageUrl').custom((value, { req }) => {
  //   req.hussey = 'Husseyexplores'
  //   if (/(http(s?):)([/|.|\w|\s|-])*\.(?:jpe?g|gif|png|webp)/i.test(value)) {
  //     return true
  //   }
  //   throw new Error('Image URL is not valid')
  // }),
  body(
    'price',
    'Price should be an integer and should be of value zero or more'
  ).isInt({
    gt: -1,
    lt: 1000000,
  }),
]

exports.editProductValidators = [
  body('id')
    .isMongoId()
    .withMessage('Product id is missing or invalid'),
  ...this.addProductValidators,
  body('id').custom(async (id, { req }) => {
    const product = await Product.findById(id)
    if (!product || product.userId.toString() !== req.user._id.toString()) {
      req.product = null
      throw new Error(
        `Product with id ${id} not exists or you don't have the sufficient permissions to modify it`
      )
    }
    req.product = product
    return true
  }),
]

exports.productShouldContainImg = body('image').custom((value, { req }) => {
  if (!req.file) {
    throw new Error('Invalid image file')
  }
  return true
})
