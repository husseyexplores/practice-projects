import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'

import StyledNav from './styles/NavStyles'

// ----------------------------------------------------------------------------

function Nav() {
  return (
    <StyledNav>
      <Link href="/items">
        <a>Shop</a>
      </Link>
      <Link href="/sell">
        <a>Sell</a>
      </Link>
      <Link href="/signup">
        <a>Signup</a>
      </Link>
      <Link href="/orders">
        <a>Orders</a>
      </Link>
      <Link href="/me">
        <a>Me</a>
      </Link>
    </StyledNav>
  )
}

Nav.propTypes = {}

Nav.defaultProps = {}

export default Nav
