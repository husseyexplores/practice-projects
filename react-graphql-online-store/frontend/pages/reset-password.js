import React from 'react'
import PropTypes from 'prop-types'
import Reset from '../components/Reset'

// ----------------------------------------------------------------------------

function ResetPasswordPage({ query }) {
  const { resetToken, email } = query
  if (!resetToken || !email) {
    return <p>Oops! Looks like the somethings wrong with the link</p>
  }

  return (
    <div>
      <h2>Reset your password</h2>
      <Reset email={email} resetToken={resetToken} />
    </div>
  )
}

ResetPasswordPage.propTypes = {
  query: PropTypes.object.isRequired,
}

ResetPasswordPage.defaultProps = {}

export default ResetPasswordPage
