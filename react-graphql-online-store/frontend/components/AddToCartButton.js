import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'

import { CURRENT_USER_QUERY } from './User'

// ----------------------------------------------------------------------------

const ADD_TO_CART_MUTATION = gql`
  mutation ADD_TO_CART_MUTATION($id: ID!, $quantity: Int!) {
    addToCart(id: $id, quantity: $quantity) {
      id
      quantity
    }
  }
`

function AddToCartButton({ id }) {
  return (
    <Mutation
      mutation={ADD_TO_CART_MUTATION}
      variables={{ id, quantity: 1 }}
      refetchQueries={[
        {
          query: CURRENT_USER_QUERY,
        },
      ]}
    >
      {(addToCartMutation, { loading, error }) => (
        <button type="button" disabled={loading} onClick={addToCartMutation}>
          Add{loading ? 'ing' : ''} To Cart
        </button>
      )}
    </Mutation>
  )
}

AddToCartButton.propTypes = {
  // Item ID
  id: PropTypes.string.isRequired,
}

AddToCartButton.defaultProps = {}

export default AddToCartButton
