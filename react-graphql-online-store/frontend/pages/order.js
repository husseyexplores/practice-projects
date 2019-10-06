import React from 'react'
import PropTypes from 'prop-types'

import Order from '../components/Order'
import PleaseSignIn from '../components/PleaseSignIn'

// ----------------------------------------------------------------------------

const OrderPage = ({ query }) => (
  <div>
    <PleaseSignIn>
      <Order id={query ? query.id : undefined} />
    </PleaseSignIn>
  </div>
)

OrderPage.propTypes = {
  query: PropTypes.object,
}

export default OrderPage
