const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const { createTransport } = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')

// //////////////////////////////////////////////////////////////////////

const transportOptions = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  },
}
exports.mailer = createTransport(sgTransport(transportOptions))

exports.viewsPath = _path => path.join(__dirname, '../views', _path)

exports.trim = str => str.trim() || ''

exports.dump = obj => `<pre><code>${JSON.stringify(obj, null, 2)}</code></pre>`

exports.throwErr = (errMsg, errReason, status) => {
  const err = new Error(errMsg)
  err.reason = errReason || null
  err.status = status || 500
  throw err
}

exports.createMap = (arr, key, convertToString) =>
  arr.reduce((map, itemObj) => {
    const _key = convertToString ? itemObj[key].toString() : itemObj[key]
    map[_key] = itemObj
    return map
  }, {})

/**
 * @param byteLength {number}
 */
exports.createRandomToken = (byteLength = 32) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(byteLength, (err, buffer) => {
      if (err) {
        console.log(err)
        const error = new Error('Internal Server Error')
        error.status = 500
        return reject(error)
      }
      const token = buffer.toString('hex')
      resolve(token)
    })
  })

exports.deleteFile = filePath => fs.unlink(filePath, err => err)
