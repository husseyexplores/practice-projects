import React from 'react'
import PropTypes from 'prop-types'

import Orders from '../components/Orders'
import PleaseSignIn from '../components/PleaseSignIn'

// ----------------------------------------------------------------------------

const OrdersPage = () => (
  <div>
    <PleaseSignIn>
      <Orders />
    </PleaseSignIn>
  </div>
)

OrdersPage.propTypes = {}

export default OrdersPage
