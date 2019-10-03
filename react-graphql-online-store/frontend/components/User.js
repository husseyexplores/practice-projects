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
      cart {
        id
        quantity
        item {
          id
          title
          price
          image
          title
        }
      }
    }
  }
`

function User({ children, ...restUserQueryProps }) {
  return (
    <Query query={CURRENT_USER_QUERY} {...restUserQueryProps}>
      {({ data, loading, ...rest }, ...restArgs) => {
        const anonymousUser = !loading && (!data || !data.me)
        const signedInUser = !loading && data && data.me

        return children(
          {
            data,
            loading,
            ...rest,
            anonymousUser,
            signedInUser,
          },
          ...restArgs
        )
      }}
    </Query>
  )
}

User.propTypes = {
  children: PropTypes.func.isRequired,
}

User.defaultProps = {}

export default User
export { CURRENT_USER_QUERY }
