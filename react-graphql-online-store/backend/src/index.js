require('dotenv').config({ path: 'variables.env' })
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const createServer = require('./createServer')
const db = require('./db')

const server = createServer()

server.express.use(cookieParser())

// decode the JWT so we can get the user id on each req
// If the userId is found, populate the user
server.express.use(async (req, res, next) => {
  const { token } = req.cookies
  const { authorization } = req.headers

  let authToken = token

  if (!authToken && authorization) {
    authToken = authorization
  }

  if (authToken) {
    if (authToken.startsWith('Bearer ')) {
      // eslint-disable-next-line prefer-destructuring
      authToken = authToken.split('Bearer ')[1]
    }

    try {
      const { userId } = jwt.verify(authToken, process.env.APP_SECRET)
      const user =
        userId &&
        (await db.query.user(
          { where: { id: userId } },
          `{ id email password name permissions resetToken resetTokenExpiry }`
        ))
      if (user) {
        req.userId = userId
        req.user = user
      }
    } catch (err) {
      // eslint-disable-line no-empty
    }
  }
  next()
})

// Use express middleware to populate current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`)
  }
)
