import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import Signup from '../components/Signup'
import Signin from '../components/Signin'
import RequestReset from '../components/RequestReset'

// ----------------------------------------------------------------------------

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 2rem;
`

function SignupPage() {
  return (
    <Columns>
      <Signup />
      <Signin />
      <RequestReset />
    </Columns>
  )
}

SignupPage.propTypes = {}

SignupPage.defaultProps = {}

export default SignupPage
