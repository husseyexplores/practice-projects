const path = require('path')
const multer = require('multer')
const uuidv4 = require('uuid/v4')

// //////////////////////////////////////////////////////////////////////

exports.productImageHandler = multer({
  limits: {
    fileSize: 10e6, // 10 mb
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) =>
      cb(null, path.join(req.rootDir, 'uploads', 'images')),
    filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
  }),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/
    const isValidMimeType = filetypes.test(file.mimetype)
    const hasValidExtension = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    )

    if (isValidMimeType && hasValidExtension) {
      return cb(null, true)
    }

    cb(null, false)
  },
}).single('image')
