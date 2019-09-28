import React from 'react'
import PropTypes from 'prop-types'
import Items from '../components/Items'

// ----------------------------------------------------------------------------

function HomePage({ query }) {
  let page = parseInt(query.page, 10) || 1
  if (!page || !Number.isInteger(page) || page < 0) {
    page = 1
  }

  return (
    <div>
      <Items page={page} />
    </div>
  )
}

HomePage.propTypes = {
  query: PropTypes.object,
}

HomePage.defaultProps = {}

export default HomePage
