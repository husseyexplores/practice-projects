const { createTransport } = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')

// ----------------------------------------------------------------------------

function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  )
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions

      : ${permissionsNeeded}

      You Have:

      ${user.permissions}
      `)
  }
}

const transportOptions = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  },
}
exports.mailer = createTransport(sgTransport(transportOptions))

exports.hasPermission = hasPermission
