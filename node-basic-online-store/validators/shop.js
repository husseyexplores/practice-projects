const { param } = require('express-validator')

// //////////////////////////////////////////////////////////////////////

exports.getOrderValidator = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid Order Id'),
]
