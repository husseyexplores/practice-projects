import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { Mutation } from 'react-apollo'

import User from './User'
import SignoutButton from './Signout'
import CartCount from './CartCount'
import NavStyles from './styles/NavStyles'

import { TOGGLE_CART_MUTATION } from './Cart'

// ----------------------------------------------------------------------------

function Nav() {
  return (
    <User>
      {({ loading, anonymousUser, signedInUser }) => {
        if (loading) {
          return null
        }
        const cartItemsCount = signedInUser.cart.reduce(
          (sum, item) => sum + item.quantity,
          0
        )
        return (
          <NavStyles>
            <Link href="/items">
              <a>Shop</a>
            </Link>
            {signedInUser && (
              <>
                <Link href="/sell">
                  <a>Sell</a>
                </Link>
                <Link href="/orders">
                  <a>Orders</a>
                </Link>
                <Link href="/me">
                  <a>Account</a>
                </Link>
                <SignoutButton />
                <Mutation mutation={TOGGLE_CART_MUTATION}>
                  {toggleCart => (
                    <button type="button" onClick={toggleCart}>
                      My Cart
                      <CartCount count={cartItemsCount} />
                    </button>
                  )}
                </Mutation>
              </>
            )}
            {anonymousUser && (
              <Link href="/signup">
                <a>SignIn</a>
              </Link>
            )}
          </NavStyles>
        )
      }}
    </User>
  )
}

Nav.propTypes = {}

Nav.defaultProps = {}

export default Nav
