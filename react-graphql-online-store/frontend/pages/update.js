import React from 'react'
import PropTypes from 'prop-types'

import UpdateItem from '../components/UpdateItem'

// ----------------------------------------------------------------------------

const UpdatePage = ({ query }) => (
  <div>
    <UpdateItem id={query ? query.id : undefined} />
  </div>
)

UpdatePage.propTypes = {
  query: PropTypes.object,
}

export default UpdatePage
