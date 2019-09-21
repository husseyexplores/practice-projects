import React from 'react'
import PropTypes from 'prop-types'

import Meta from './Meta'
import Header from './Header'

// ----------------------------------------------------------------------------

function Page({ children }) {
  return (
    <div>
      <Meta />
      <Header />
      {children}
    </div>
  )
}

Page.propTypes = {
  children: PropTypes.node,
}

Page.defaultProps = {}

export default Page
