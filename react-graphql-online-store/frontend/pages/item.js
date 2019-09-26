import React from 'react'
import PropTypes from 'prop-types'
import SingleItem from '../components/SingleItem'

// ----------------------------------------------------------------------------

function item({ query }) {
  return <SingleItem id={query ? query.id : undefined} />
}

item.propTypes = {
  query: PropTypes.object,
}

item.defaultProps = {}

export default item
