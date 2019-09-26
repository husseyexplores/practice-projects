import React from 'react'
import PropTypes from 'prop-types'

import UpdateItem from '../components/UpdateItem'

// ----------------------------------------------------------------------------

const Update = ({ query }) => (
  <div>
    <UpdateItem id={query ? query.id : undefined} />
  </div>
)

Update.propTypes = {
  query: PropTypes.object,
}

export default Update
