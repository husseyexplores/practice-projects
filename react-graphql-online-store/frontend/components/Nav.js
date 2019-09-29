import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'

import User from './User'
import SignoutButton from './Signout'
import NavStyles from './styles/NavStyles'

// ----------------------------------------------------------------------------

function Nav() {
  return (
    <User>
      {({ data, loading }) => {
        if (loading) {
          return null
        }
        const anonymousUser = !loading && (!data || !data.me)
        const signedInUser = !loading && data && data.me

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
              </>
            )}
            {anonymousUser && (
              <Link href="/signup">
                <a>SignIn</a>
              </Link>
            )}
            {signedInUser && <SignoutButton />}
          </NavStyles>
        )
      }}
    </User>
  )
}

Nav.propTypes = {}

Nav.defaultProps = {}

export default Nav
