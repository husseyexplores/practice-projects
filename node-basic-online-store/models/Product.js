const { Schema, model } = require('mongoose')

// //////////////////////////////////////////////////////////////////////

const productSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID cannot be empty'],
  },
  title: {
    type: String,
    trim: true,
    required: [true, 'Product title can not be empty'],
  },
  price: { type: Number, required: [true, 'Product price can not be empty'] },
  description: {
    type: String,
    trim: true,
    required: [true, 'Product description can not be empty'],
  },
  imageUrl: {
    type: String,
    trim: true,
    required: [true, 'Product image URL can not be empty'],
  },
})

const Product = model('Product', productSchema)

module.exports = Product

/*
const { ObjectID } = require('mongodb')
const { getDb } = require('../utils/database')

// //////////////////////////////////////////////////////////////////////

class Product {
  constructor({ title, price, description, imageUrl, id, userId }) {
    this.product = {
      _id: id ? new ObjectID(id) : undefined,
      userId,
      title,
      price,
      description,
      imageUrl,
    }
  }

  // Collection for all of the products
  static collection() {
    return getDb().collection('products')
  }

  save() {
    // TODO: Validate product schema

    if (this.product._id) {
      // Update the product
      return Product.collection().updateOne(
        { _id: this.product._id },
        { $set: this.product }
      )
    }

    // Create a new one
    return Product.collection().insertOne(this.product)
  }

  static fetchAll() {
    return Product.collection()
      .find()
      .toArray()
  }

  static findById(id) {
    return Product.collection()
      .find({ _id: new ObjectID(id) })
      .next()
  }

  static deleteById(id) {
    return Product.collection().deleteOne({ _id: new ObjectID(id) })
  }
}

module.exports = Product
*/
