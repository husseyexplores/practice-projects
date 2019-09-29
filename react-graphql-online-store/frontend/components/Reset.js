import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import Form from './styles/Form'
import ErrorMessage from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

// ----------------------------------------------------------------------------

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION(
    $email: String!
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      email: $email
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      name
      email
    }
  }
`

class Reset extends Component {
  state = {
    password: '',
    confirmPassword: '',
  }

  handleChange = ({ target: { value, name } }) => {
    this.setState({ [name]: value })
  }

  render() {
    const { confirmPassword, password } = this.state

    return (
      <Mutation
        mutation={RESET_PASSWORD_MUTATION}
        refetchQueries={[
          {
            query: CURRENT_USER_QUERY,
          },
        ]}
      >
        {(restPasswordMutation, { loading, error }) => (
          <Form
            method="POST"
            onSubmit={async e => {
              e.preventDefault()
              const { email, resetToken } = this.props
              await restPasswordMutation({
                variables: { ...this.state, email, resetToken },
              })
              Router.push({ pathname: '/' })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Set a new password</h2>

              <ErrorMessage error={error} />
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
              <label htmlFor="password">
                Confirm Password
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Enter A Password"
                  required
                  value={confirmPassword}
                  onChange={this.handleChange}
                />
              </label>

              <button type="submit">Save New Password</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

Reset.propTypes = {
  email: PropTypes.string.isRequired,
  resetToken: PropTypes.string.isRequired,
}

Reset.defaultProps = {}

export default Reset
