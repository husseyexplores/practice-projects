const { Schema, model } = require('mongoose')

const { Types } = Schema
// //////////////////////////////////////////////////////////////////////

const orderSchema = Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
  },
  items: [
    {
      _id: {
        type: Types.ObjectId,
        required: true,
      },
      title: {
        type: String,
        trim: true,
        required: [true, 'Product title can not be empty'],
      },
      price: {
        type: Number,
        required: [true, 'Product price can not be empty'],
      },
      imageUrl: {
        type: String,
        trim: true,
        required: [true, 'Product image URL can not be empty'],
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
})

const Order = model('Orders', orderSchema)

module.exports = Order
