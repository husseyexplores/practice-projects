const util = require('util')
const cloudinary = require('cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const deleteCloudinaryImage = util.promisify(cloudinary.v2.uploader.destroy)
const getCloudinaryPublicIdFromUrl = imgUrl => {
  const urlParts = imgUrl.split('/')
  const lastPart = urlParts[urlParts.length - 1]
  const publicId = lastPart.split('.')[0]
  return publicId
}

module.exports = {
  cloudinary,
  deleteCloudinaryImage,
  getCloudinaryPublicIdFromUrl,
}
