import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { CURRENT_USER_QUERY } from './User'

// ----------------------------------------------------------------------------

const Button = styled.button`
  font-size: 3rem;
  background: none;
  border: none;
  &:hover {
    color: ${({ theme }) => theme.red};
  }
  cursor: pointer;
`

const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

// This gets called as soon as we delete the item from the server
function onAfterDeleteItem(cache, { data }) {
  const deletedItemId = data.removeFromCart.id
  // 1. Read the cache
  const { me } = cache.readQuery({ query: CURRENT_USER_QUERY })

  // 2. Remove that item from the cart cache
  const updatedCart = me.cart.filter(({ id }) => id !== deletedItemId)

  // 3. Update the cache
  cache.writeQuery({
    query: CURRENT_USER_QUERY,
    data: { me: { ...me, cart: updatedCart } },
  })
}

function RemoveFromCart({ id }) {
  return (
    <Mutation
      mutation={REMOVE_FROM_CART_MUTATION}
      variables={{ id }}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      update={onAfterDeleteItem}
      optimisticResponse={{
        __typename: 'Mutation',
        removeFromCart: { __typename: 'CartItem', id },
      }}
    >
      {(deleteItemMutation, { loading }) => (
        <Button
          title="Delete Item"
          disabled={loading}
          onClick={deleteItemMutation}
        >
          &times;
        </Button>
      )}
    </Mutation>
  )
}

RemoveFromCart.propTypes = {
  id: PropTypes.string.isRequired,
}

RemoveFromCart.defaultProps = {}

export default RemoveFromCart
