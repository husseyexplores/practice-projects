import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import Form from './styles/Form'
import ErrorMessage from './ErrorMessage'

// ----------------------------------------------------------------------------

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
      id
      name
      email
    }
  }
`

class Signup extends Component {
  state = {
    email: '',
    name: '',
    password: '',
  }

  handleChange = ({ target: { value, name } }) => {
    this.setState({ [name]: value })
  }

  render() {
    const { email, name, password } = this.state

    return (
      <Mutation mutation={SIGNUP_MUTATION}>
        {(signupMutation, { loading, error }) => (
          <Form
            method="POST"
            onSubmit={async e => {
              e.preventDefault()
              await signupMutation({ variables: { ...this.state } })
              Router.push({ pathname: '/' })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign Up for An Account</h2>

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
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter Your Name"
                  required
                  value={name}
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

              <button type="submit">Sign Up!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

Signup.propTypes = {}

Signup.defaultProps = {}

export default Signup
