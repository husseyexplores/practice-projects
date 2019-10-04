import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { adopt } from 'react-adopt'
import { Query, Mutation } from 'react-apollo'

import User from './User'
import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'
import CartItem from './CartItem'
import formatMoney from '../lib/formatMoney'
import calcTotalPrice from '../lib/calcTotalPrice'

// ----------------------------------------------------------------------------

const LOCAL_STATE_QUERY = gql`
  query LOCAL_STATE_QUERY {
    cartOpen @client
  }
`

const TOGGLE_CART_MUTATION = gql`
  mutation TOGGLE_CART_MUTATION($isOn: Boolean!) {
    toggleCart @client
  }
`

/* eslint-disable react/display-name, react/prop-types */
const ComposedRenderProps = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => (
    <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>
  ),
  localCache: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
})
/* eslint-enable react/display-name */

function Cart() {
  return (
    <ComposedRenderProps>
      {({ user, toggleCart, localCache }) => {
        const { loading, anonymousUser, signedInUser } = user
        const { data } = localCache

        if (loading || anonymousUser) {
          return null
        }
        const { cart } = signedInUser
        const itemsInCart = cart.length
        const cartTotal = calcTotalPrice(cart)
        return (
          <CartStyles open={data.cartOpen}>
            <header>
              <CloseButton title="close" onClick={toggleCart}>
                &times;
              </CloseButton>
              <Supreme>Your Cart</Supreme>
              <p>
                You have {itemsInCart} item
                {itemsInCart === 1 ? '' : 's'} in your cart.
              </p>
            </header>

            <ul>
              {cart.map(cartItem => (
                <CartItem key={cartItem.id} cartItem={cartItem} />
              ))}
            </ul>

            <footer>
              <p>{formatMoney(cartTotal)}</p>
              <SickButton>Checkout</SickButton>
            </footer>
          </CartStyles>
        )
      }}
    </ComposedRenderProps>
  )
}

Cart.propTypes = {}

Cart.defaultProps = {}

export default Cart
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION }
