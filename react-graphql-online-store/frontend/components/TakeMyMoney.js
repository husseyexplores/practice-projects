import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Router from 'next/router'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import NProgress from 'nprogress'
import StripeCheckout from 'react-stripe-checkout'

import ErrorMessage from './ErrorMessage'
import User, { CURRENT_USER_QUERY } from './User'
import calcTotalPrice from '../lib/calcTotalPrice'

// ----------------------------------------------------------------------------

const Disableable = styled.div`
  ${props => (props.disabled ? 'pointer-events: none; opacity: 0.7;' : '')};
`

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`

function getTotalItems(cart) {
  return cart.reduce((sum, cartItem) => {
    if (!cartItem || !cartItem.item) return sum
    return sum + cartItem.quantity
  }, 0)
}

class TakeMyMoney extends Component {
  onToken = async (token, createOrder) => {
    // Show the loading bar (Will get completed automatically)
    NProgress.start()

    // Manually call the mutation to create order
    const { data } = await createOrder({ variables: { token } })

    // Redirect to order page
    Router.push({ pathname: '/order', query: { id: data.createOrder.id } })
  }

  render() {
    const { children } = this.props
    return (
      <User>
        {({ signedInUser, loading }) => {
          if (loading || !signedInUser) {
            return null
          }

          const { cart, email } = signedInUser

          // If the product that is in the cart is deleted,
          // then `cartItem.item` will be null. We filter out such products here
          const validCart = cart.filter(cartItem =>
            Boolean(cartItem && cartItem.item)
          )

          const totalItemsCount = getTotalItems(validCart)
          const cartTotalPrice = calcTotalPrice(validCart) // in cents

          return (
            <Mutation
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
              {(createOrder, { loading: creatingOrder, error }) => (
                <Disableable disabled={creatingOrder || validCart.length === 0}>
                  <StripeCheckout
                    amount={cartTotalPrice}
                    name="Sick Fits"
                    description={`Orders of ${totalItemsCount} item${
                      totalItemsCount === 1 ? '' : 's'
                    }!`}
                    image={validCart[0] ? validCart[0].item.image : undefined}
                    stripeKey="pk_test_aTw4pvPuJQ573ILkAGuOoZfb006Hk4barE"
                    currency="USD"
                    email={email}
                    token={res => this.onToken(res.id, createOrder)}
                  >
                    {children}
                  </StripeCheckout>
                </Disableable>
              )}
            </Mutation>
          )
        }}
      </User>
    )
  }
}

TakeMyMoney.propTypes = {
  children: PropTypes.node,
}

TakeMyMoney.defaultProps = {}

export default TakeMyMoney
