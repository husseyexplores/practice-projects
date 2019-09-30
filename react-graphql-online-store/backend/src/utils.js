const { createTransport } = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')

// ----------------------------------------------------------------------------

function hasPermission(user, permissionsNeeded, debugError = false) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  )
  if (!matchedPermissions.length) {
    if (debugError) {
      throw new Error(`You do not have sufficient permissions

        : ${permissionsNeeded}

        You Have:

        ${user.permissions}
        `)
    } else {
      throw new Error('Insufficient permissions.')
    }
  }
  return true
}

const transportOptions = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  },
}
exports.mailer = createTransport(sgTransport(transportOptions))

exports.hasPermission = hasPermission
