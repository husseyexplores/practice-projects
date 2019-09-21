import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'

function Nav() {
  return (
    <div>
      <Link href="/">
        <a>Home</a>
      </Link>
      <Link href="/sell">
        <a>Sell</a>
      </Link>
    </div>
  )
}

Nav.propTypes = {}

Nav.defaultProps = {}

export default Nav
