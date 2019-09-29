import React from 'react'
import PropTypes from 'prop-types'

import CreateItem from '../components/CreateItem'
import PleaseSignIn from '../components/PleaseSignIn'

// ----------------------------------------------------------------------------

const SellPage = () => (
  <div>
    <PleaseSignIn>
      <CreateItem />
    </PleaseSignIn>
  </div>
)

SellPage.propTypes = {}

export default SellPage
