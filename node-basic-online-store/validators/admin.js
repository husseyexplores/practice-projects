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
  body('imageUrl').custom((value, { req }) => {
    req.hussey = 'Husseyexplores'
    if (/(http(s?):)([/|.|\w|\s|-])*\.(?:jpe?g|gif|png|webp)/i.test(value)) {
      return true
    }
    throw new Error('Image URL is not valid')
  }),
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
    .exists({ checkFalsy: true })
    .withMessage('Product id is missing'),
  ...this.addProductValidators,
  body('id').custom(async (id, { req }) => {
    const product = await Product.findById(id)
    if (!product || product.userId.toString() !== req.user._id.toString()) {
      throw new Error(
        `Product with id ${id} not exists or you don't have the sufficient permissions to modify it`
      )
    }
    req.product = product
  }),
]
