import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import Form from './styles/Form'
import ErrorMessage from './ErrorMessage'

// ----------------------------------------------------------------------------

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`

class RequestReset extends Component {
  state = {
    email: '',
  }

  handleChange = ({ target: { value, name } }) => {
    this.setState({ [name]: value })
  }

  render() {
    const { email } = this.state

    return (
      <Mutation mutation={REQUEST_RESET_MUTATION}>
        {(requestResetMutation, { loading, error, data, called }) => (
          <Form
            method="POST"
            onSubmit={async e => {
              e.preventDefault()
              await requestResetMutation({ variables: { ...this.state } })
              this.setState({ email: '' })
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Request a password reset</h2>

              <ErrorMessage error={error} />
              {called && !error && !loading && data && (
                <p>Success! Check your email for the reset link.</p>
              )}
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
              <button type="submit">Request Reset</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

RequestReset.propTypes = {}

RequestReset.defaultProps = {}

export default RequestReset
