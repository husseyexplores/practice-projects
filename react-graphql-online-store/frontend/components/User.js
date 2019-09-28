import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

// ----------------------------------------------------------------------------

const CURRENT_USER_QUERY = gql`
  query CURRENT_USER_QUERY {
    me {
      id
      email
      name
      permissions
    }
  }
`

function User({ children, ...restProps }) {
  return (
    <Query query={CURRENT_USER_QUERY} {...restProps}>
      {children}
    </Query>
  )
}

User.propTypes = {
  children: PropTypes.func.isRequired,
}

User.defaultProps = {}

export default User
export { CURRENT_USER_QUERY }
