const { throwErr } = require('../utils/helpers')
const { catchAsyncErr } = require('../handlers/errorHandlers')
const Product = require('../models/Product')

exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
  })
}

exports.postAddProduct = catchAsyncErr(async (req, res) => {
  const { title, imageUrl, description, price } = req.body

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

  if (!product) {
    res.render('admin/edit-product', {
      pageTitle: 'Product Not Found',
      path: '/admin/edit-product',
      product: null,
    })
  }

  res.render('admin/edit-product', {
    pageTitle: 'Edit Product',
    path: '/admin/edit-product',
    product,
  })
})

exports.postEditProduct = catchAsyncErr(async (req, res) => {
  const { title, imageUrl, description, price, id } = req.body

  const product = await Product.findById(id)

  if (!product) {
    throwErr(
      'Could not updated the product',
      `Product with id ${id} not found`,
      404
    )
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

  if (!product) {
    throwErr(
      'Could not delete the product',
      `Product with id ${id} not found`,
      404
    )
  }

  await Product.findOneAndRemove({ _id: id })

  res.redirect('/admin/products')
})

exports.getProducts = catchAsyncErr(async (req, res) => {
  const products = await Product.find()

  res.render('admin/products', {
    pageTitle: 'Admin Products',
    path: '/admin/products',
    prods: products,
  })
})
