const { Schema, model } = require('mongoose')

const Order = require('./Order')
const Product = require('./Product')
const { createMap } = require('../utils/helpers')

const { Types } = Schema

// //////////////////////////////////////////////////////////////////////

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    required: [true, 'Email can not be empty'],
  },
  password: {
    type: String,
    required: [true, 'Password can not be empty'],
  },
  resetToken: String,
  resetTokenExpiry: Date,
  cart: {
    items: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: [true, 'Cart item quantity can not be empty'],
        },
      },
    ],
  },
})

userSchema.methods.addToCart = function addToCart(product) {
  const cartProductIdx = this.cart.items.findIndex(
    p => p.productId.toString() === product._id.toString()
  )

  let qty = 1
  const updatedCartItems = [...this.cart.items]

  // if product is already in the cart, increase the qty
  if (cartProductIdx > -1) {
    qty = this.cart.items[cartProductIdx].quantity + 1
    updatedCartItems[cartProductIdx].quantity = qty
  } else {
    // otherwise, add it to the cart
    updatedCartItems.push({
      productId: product._id,
      quantity: qty,
    })
  }

  const updatedCart = {
    items: updatedCartItems,
  }

  this.cart = updatedCart

  return this.save()
}

userSchema.methods.getCart = async function getCart() {
  const userWithCartData = await this.populate(
    'cart.items.productId'
  ).execPopulate()

  const { cart } = userWithCartData

  // Filter out cart products that have been deleted
  const validProducts = cart.items.filter(
    item => item.productId && item.productId._id
  )

  // If original cart items length is not equal to the filtered length,
  // then there must be some products that have been deleted
  if (validProducts.length !== cart.items.length) {
    this.cart = { items: validProducts }
    await this.save()
  }

  // Format cart data
  const cartItems = validProducts.map(item => ({
    ...item.toObject(),
    productId: item.productId._id,
    ...item.productId.toObject(),
  }))

  return cartItems
}

userSchema.methods.removeFromCart = function removeFromCart(productId) {
  const updatedCartItems = this.cart.items.filter(
    item => item.productId.toString() !== productId.toString()
  )

  const updatedCart = {
    items: updatedCartItems,
  }

  this.cart = updatedCart

  return this.save()
}

userSchema.methods.clearCart = function clearCart() {
  this.cart = { items: [] }
  return this.save()
}

userSchema.methods.createOrder = async function createOrder() {
  const cartProducts = await this.getCart()

  if (!cartProducts.length) {
    const err = new Error('Could not create the order')
    err.reason = 'No products in the cart'
    err.status = 400
    throw err
  }

  const totalPrice = cartProducts.reduce(
    (total, { price, quantity }) => total + quantity * price,
    0
  )

  // Save the products in the orders, not the references
  // because the data in the order must remain the same it was
  // during the time of creating the order
  const orderData = { userId: this._id, items: cartProducts, totalPrice }

  const order = new Order(orderData)
  const result = await order.save()
  await this.clearCart()
  return result
}

userSchema.methods.getOrders = function getOrders() {
  return Order.find({ userId: this._id })
}

const User = model('User', userSchema)
module.exports = User

/*
const { ObjectID } = require('mongodb')
const { getDb } = require('../utils/database')

// //////////////////////////////////////////////////////////////////////

class User {
  constructor({ name, email, id, cart }) {
    this.user = {
      _id: id ? new ObjectID(id) : undefined,
      name,
      email,
      cart,
    }

    const defaultCart = { items: [] }
    // Make sure cart schema is valid
    if (typeof cart === 'object' && Array.isArray(cart) === false) {
      if (!Array.isArray(this.user.cart.items)) {
        this.user.cart = defaultCart
      }
    } else {
      // default cart schema
      this.user.cart = defaultCart
    }
  }

  static collection() {
    return getDb().collection('users')
  }

  static findById(id) {
    return User.collection().findOne({ _id: new ObjectID(id) })
  }

  static deleteById(id) {
    return User.collection().deleteOne({ _id: new ObjectID(id) })
  }

  save() {
    // TODO: Validate schema

    if (this.user._id) {
      // Update the user
      return User.collection().updateOne(
        { _id: this.user._id },
        { $set: this.user }
      )
    }

    // Create a new one
    return User.collection().insertOne(this.user)
  }

  updateCart(cart) {
    return User.collection().updateOne(
      { id: this.user._id },
      { $set: { cart } }
    )
  }

  addToCart(product) {
    const cartProductIdx = this.user.cart.items.findIndex(
      p => p.productId.toString() === product._id.toString()
    )

    let qty = 1
    const updatedCartItems = [...this.user.cart.items]

    // if product is already in the cart, increase the qty
    if (cartProductIdx > -1) {
      qty = this.user.cart.items[cartProductIdx].quantity + 1
      updatedCartItems[cartProductIdx].quantity = qty
    } else {
      // otherwise, add it to the cart
      updatedCartItems.push({
        productId: new ObjectID(product._id),
        quantity: qty,
      })
    }

    const updatedCart = {
      items: updatedCartItems,
    }

    return this.updateCart(updatedCart)
  }

  removeFromCart(productId) {
    const updatedCartItems = this.user.cart.items.filter(
      item => item.productId.toString() !== productId.toString()
    )

    const updatedCart = {
      items: updatedCartItems,
    }

    return this.updateCart(updatedCart)
  }

  getCart() {
    const totalCartItems = this.user.cart.items.length
    const cartProductIds = this.user.cart.items.map(p => p.productId)

    return getDb()
      .collection('products')
      .find({
        _id: {
          $in: cartProductIds,
        },
      })
      .toArray()
      .then(products => {
        const productsMap = createMap(products, '_id', true)

        // If a product is in the cart, but got deleted
        // Remove it from cart too
        if (products.length !== totalCartItems) {
          const validProducts = this.user.cart.items.filter(item => {
            const productExists = !!productsMap[item.productId.toString()]
            return productExists
          })

          const updatedCart = { items: validProducts }
          return Promise.all([products, this.updateCart(updatedCart)])
        }

        return Promise.all([products])
      })
      .then(([products]) => {
        // Create a map of cart items to access quantities efficiently later on
        const cartItemsMap = createMap(this.user.cart.items, 'productId', true)

        // Append the quantity to the fetched proudcts
        return products.map(p => ({
          ...p,
          quantity: cartItemsMap[p._id.toString()].quantity,
        }))
      })
  }

  clearCart() {
    this.user.cart = { items: [] }
    return User.collection().updateOne(
      { id: this.user._id },
      { $set: { cart: this.user.cart } }
    )
  }

  createOrder() {
    return new Promise((resolve, reject) => {
      this.getCart().then(products => {
        if (!products.length) {
          const err = new Error('Could not create the order')
          err.reason = 'No products in the cart'
          err.status = 400
          return reject(err)
        }

        const totalPrice = products.reduce(
          (total, { price, quantity }) => total + quantity * price,
          0
        )

        // Save the products in the orders, not the references
        // because the data in the order must remain the same it was
        // during the time of creating the order
        const orderData = { userId: this.user._id, items: products, totalPrice }
        return getDb()
          .collection('orders')
          .insertOne(orderData)
          .then(orderCreateResult =>
            // Clear the cart after creating order
            Promise.all([orderCreateResult, this.clearCart()])
          )
          .then(([orderCreateResult]) => {
            resolve(orderCreateResult)
          })
          .catch(reject)
      })
    })
  }

  getOrders() {
    return getDb()
      .collection('orders')
      .find({ userId: this.user._id })
      .toArray()
  }
}

module.exports = User
*/
