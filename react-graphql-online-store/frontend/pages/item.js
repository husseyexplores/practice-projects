import React from 'react'
import PropTypes from 'prop-types'
import SingleItem from '../components/SingleItem'

// ----------------------------------------------------------------------------

function ItemPage({ query }) {
  return <SingleItem id={query ? query.id : undefined} />
}

ItemPage.propTypes = {
  query: PropTypes.object,
}

ItemPage.defaultProps = {}

export default ItemPage
