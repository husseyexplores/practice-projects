import React from 'react'
import PropTypes from 'prop-types'

import PleaseSignIn from '../components/PleaseSignIn'
import Permissions from '../components/Permissions'

// ----------------------------------------------------------------------------

function PermissionsPage({ query }) {
  return (
    <PleaseSignIn>
      <div>
        <h2>Manage User Permissions</h2>
        <Permissions />
      </div>
    </PleaseSignIn>
  )
}

PermissionsPage.propTypes = {
  query: PropTypes.object,
}

PermissionsPage.defaultProps = {}

export default PermissionsPage
