import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import Form from './styles/Form'
import ErrorMessage from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

// ----------------------------------------------------------------------------

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      name
      email
    }
  }
`

class Signin extends Component {
  state = {
    email: '',
    password: '',
  }

  handleChange = ({ target: { value, name } }) => {
    this.setState({ [name]: value })
  }

  render() {
    const { email, password } = this.state

    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        refetchQueries={[
          {
            query: CURRENT_USER_QUERY,
          },
        ]}
      >
        {(signinMutation, { loading, error }) => (
          <Form
            method="POST"
            onSubmit={async e => {
              e.preventDefault()
              await signinMutation({ variables: { ...this.state } })
              Router.push(this.props.redirectPath)
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign into Your Account</h2>

              <ErrorMessage error={error} />
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter Your E-mail"
                  required
                  value={email}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter A Password"
                  required
                  value={password}
                  onChange={this.handleChange}
                />
              </label>

              <button type="submit">Sign In!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

Signin.propTypes = {
  redirectPath: PropTypes.string,
}

Signin.defaultProps = {
  redirectPath: '/',
}

export default Signin
