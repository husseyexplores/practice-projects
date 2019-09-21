import React from 'react'
import PropTypes from 'prop-types'

import Nav from './Nav'

function Header() {
  return (
    <div>
      <div className="bar">
        <a href="">Sick Fits</a>
        <Nav />
      </div>
      <div className="sub-bar">
        <p>Search</p>
      </div>
      <div>Cart</div>
    </div>
  )
}

Header.propTypes = {}

Header.defaultProps = {}

export default Header
