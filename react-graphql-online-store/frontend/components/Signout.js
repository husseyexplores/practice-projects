import React from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import { CURRENT_USER_QUERY } from './User'

// ----------------------------------------------------------------------------

const SIGNOUT_MUTATION = gql`
  mutation SIGNOUT_MUTATION {
    signout {
      message
    }
  }
`

function Signout({ children }) {
  return (
    <Mutation
      mutation={SIGNOUT_MUTATION}
      refetchQueries={[
        {
          query: CURRENT_USER_QUERY,
        },
      ]}
    >
      {(signoutMutation, { loading, error }) => (
        <button
          aria-busy={loading || false}
          onClick={async () => {
            await signoutMutation()
            // Redirect to homepage
            Router.push('/')
          }}
          type="button"
        >
          {children}
        </button>
      )}
    </Mutation>
  )
}

Signout.propTypes = {
  children: PropTypes.node,
}

Signout.defaultProps = {
  children: 'Sign Out',
}

export default Signout
