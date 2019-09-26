import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'

import ErrorMessage from './ErrorMessage'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'

// ----------------------------------------------------------------------------

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
      title
      description
      price
    }
  }
`
class UpdateItem extends Component {
  /* eslint-disable react/no-unused-state */
  state = {}

  handleChange = ({ target: { value, name, type } }) => {
    const val = type === 'number' ? parseFloat(value) : value
    this.setState({ [name]: val })
  }

  render() {
    const { title, description, price } = this.state

    if (!this.props.id) {
      return <ErrorMessage error="Item ID is missing" />
    }

    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading: queryLoading, error: queryErr }) => {
          if (queryErr) {
            return <ErrorMessage error={queryErr} />
          }

          const isItemQueried = !queryLoading
          const itemNotFound = data && !data.item
          if (isItemQueried && itemNotFound) {
            const err = new Error('Item does not exist')
            return <ErrorMessage error={err} />
          }

          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION}>
              {(updateItem, { loading, error }) => (
                <Form
                  onSubmit={async e => {
                    e.preventDefault()

                    // Call the mutation
                    const changes = { ...this.state }
                    const response = await updateItem({
                      variables: { id: this.props.id, ...changes },
                    })
                  }}
                >
                  <ErrorMessage error={error} />
                  <fieldset
                    disabled={loading || queryLoading}
                    aria-busy={loading || queryLoading}
                  >
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        value={queryLoading ? '' : title || data.item.title}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        value={queryLoading ? '' : price || data.item.price}
                        min="0"
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="description">
                      Description
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Enter A Description"
                        required
                        value={
                          queryLoading
                            ? ''
                            : description || data.item.description
                        }
                        onChange={this.handleChange}
                      />
                    </label>

                    <button type="submit">
                      Sav{loading ? 'ing' : 'e'} Changes
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

UpdateItem.propTypes = {
  id: PropTypes.string.isRequired,
}

UpdateItem.defaultProps = {}

export default UpdateItem
export { UPDATE_ITEM_MUTATION, SINGLE_ITEM_QUERY }
