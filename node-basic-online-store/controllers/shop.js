const fs = require('fs')
const path = require('path')
const PDFDoc = require('pdfkit')
const { validationResult } = require('express-validator')
const { catchAsyncErr } = require('../handlers/errorHandlers')
const { throwErr } = require('../utils/helpers')
const Product = require('../models/Product')

exports.getIndex = catchAsyncErr(async (req, res) => {
  const products = await Product.find()

  res.render('shop/index', {
    pageTitle: 'Shop',
    path: '/',
    prods: products,
  })
})

exports.getProducts = catchAsyncErr(async (req, res) => {
  const products = await Product.find()

  res.render('shop/product-list', {
    pageTitle: 'All Products',
    path: '/products',
    prods: products,
  })
})

exports.getProduct = catchAsyncErr(async (req, res) => {
  const { productId } = req.params

  const product = await Product.findById(productId)

  if (!product) {
    return res.render('shop/product-detail', {
      pageTitle: 'Product Not Found',
      path: '/products',
      product: null,
    })
  }

  return res.render('shop/product-detail', {
    pageTitle: product.title,
    path: `/products/${productId}`,
    product,
  })
})

exports.getCart = catchAsyncErr(async (req, res) => {
  const cartProducts = await req.user.getCart()

  if (!cartProducts) throwErr('Cart not found', 'Server/Database Erorr', 500)

  const totalPrice = cartProducts.reduce(
    (total, { price, quantity }) => total + quantity * price,
    0
  )

  res.render('shop/cart', {
    pageTitle: 'Your Cart',
    path: '/cart',
    itemCount: cartProducts.length,
    products: cartProducts,
    totalPrice,
  })
})

exports.postCart = catchAsyncErr(async (req, res) => {
  const { id } = req.body // product Id

  const product = await Product.findById(id)
  if (!product)
    throwErr(
      'Cannot Add the product to the cart',
      `Product with the id ${id} not found`,
      404
    )

  await req.user.addToCart(product)

  res.redirect('/cart')
})

exports.postDeleteCartItem = catchAsyncErr(async (req, res) => {
  const { id } = req.body // product Id

  const result = await req.user.removeFromCart(id)
  // if (result.modifiedCount !== 1 && result.matchedCount !== 1) {
  //   // Erorr, could not delete the product
  // }
  res.redirect('/cart')
})

exports.postOrder = catchAsyncErr(async (req, res) => {
  // Add the products in the user's cart to the order
  await req.user.createOrder()

  res.redirect('/orders')
})

exports.getOrders = catchAsyncErr(async (req, res) => {
  const orders = await req.user.getOrders()

  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders',
    orders,
  })
})

exports.getInvoice = catchAsyncErr(async (req, res, next) => {
  const errors = validationResult(req)
  const errMsgs = [...new Set(errors.array().map(({ msg }) => msg))]
  if (!errors.isEmpty()) {
    req.flash('error', errMsgs)
    return res.redirect('/')
  }

  const { orderId } = req.params
  const order = await req.user.getOrder(orderId)
  if (!order) {
    req.flash('error', 'Order not found')
    return res.redirect('/')
  }

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `inline; filename="invoice-${orderId}.pdf"`
  )

  const pdf = new PDFDoc()
  pdf.pipe(res)
  pdf.fontSize(18).text('Invoice', { underline: true })
  pdf.fontSize(12)
  pdf.text(`Order#${orderId}`)
  pdf.fontSize(12)
  pdf.text(`-------------------------------------------------------`)
  pdf.text(' ')

  pdf.text(`Product Name - Qauntity - Unit Price`)
  order.items.forEach(({ title, price, quantity }) => {
    pdf.text(`${title} - x${quantity} - $${price}`)
  })
  pdf.text(' ')
  pdf.text(`Total: $${order.totalPrice}`)

  pdf.end()
})

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/cart',
  })
}
