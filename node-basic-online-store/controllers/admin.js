const { validationResult } = require('express-validator')
const { throwErr } = require('../utils/helpers')
const { catchAsyncErr } = require('../handlers/errorHandlers')
const Product = require('../models/Product')
// //////////////////////////////////////////////////////////////////////

exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    isEditting: false,
  })
}

exports.postAddProduct = catchAsyncErr(async (req, res) => {
  const errors = validationResult(req)
  const { title, imageUrl, description, price } = req.body

  if (!errors.isEmpty()) {
    const errMsgs = [...new Set(errors.array().map(({ msg }) => msg))]
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      product: { title, imageUrl, description, price },
      errorFlash: errMsgs,
      validationErrors: errors.mapped(),
      isEditting: false,
    })
  }

  const product = new Product({
    userId: req.user._id,
    title,
    description,
    price,
    imageUrl,
  })

  await product.save()

  res.redirect('/admin/products')
})

exports.getEditProduct = catchAsyncErr(async (req, res) => {
  const { id } = req.params
  // const product = await Product.findByPk(id)
  const product = await Product.findById(id)

  if (!product || product.userId.toString() !== req.user._id.toString()) {
    return res.render('admin/add-product', {
      pageTitle: 'Product Not Found',
      path: '/admin/edit-product',
      product: null,
      isEditting: false,
    })
  }

  res.render('admin/add-product', {
    pageTitle: 'Edit Product',
    path: '/admin/edit-product',
    product,
    isEditting: true,
  })
})

exports.postEditProduct = catchAsyncErr(async (req, res) => {
  const { product } = req
  const { title, imageUrl, description, price, id } = req.body

  if (!product) {
    throwErr(
      'Could not updated the product',
      `Product with id ${id} not found`,
      404
    )
  }

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const errMsgs = [...new Set(errors.array().map(({ msg }) => msg))]
    return res.status(422).render('admin/add-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      product: {
        title,
        imageUrl,
        description,
        price,
        _id: id,
      },
      errorFlash: errMsgs,
      validationErrors: errors.mapped(),
      isEditting: true,
    })
  }

  product.title = title
  product.imageUrl = imageUrl
  product.description = description
  product.price = price

  await product.save()

  res.redirect('/admin/products')
})

exports.postDeleteProduct = catchAsyncErr(async (req, res) => {
  const { id } = req.body
  const product = await Product.findById(id)

  if (!product || product.userId.toString() !== req.user._id.toString()) {
    throwErr(
      'Could not delete the product',
      `Product with id ${id} not found`,
      404
    )
  }

  await Product.findOneAndRemove({ _id: id, userId: req.user._id })

  res.redirect('/admin/products')
})

exports.getProducts = catchAsyncErr(async (req, res) => {
  const products = await Product.find({ userId: req.user.id })

  res.render('admin/products', {
    pageTitle: 'Admin Products',
    path: '/admin/products',
    prods: products,
  })
})
