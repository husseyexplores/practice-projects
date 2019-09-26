import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { ALL_ITEMS_QUERY } from './Items'

// ----------------------------------------------------------------------------

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(where: { id: $id }) {
      id
    }
  }
`

class DeleteItem extends Component {
  update = (cache, payload) => {
    if (!payload.data || !payload.data.deleteItem) {
      return
    }
    // Update apollo cache manually to update the UI
    // 1. Read the cache for the items we want
    const { items } = cache.readQuery({ query: ALL_ITEMS_QUERY })

    // 2. Filter out the deleted item
    const filteredItems = items.filter(
      item => item.id !== payload.data.deleteItem.id
    )

    // 3. Update the cache
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data: { items: filteredItems } })
  }

  render() {
    const { id, children } = this.props
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id }}
        update={this.update}
      >
        {(deleteItem, { loading, error }) => (
          <button
            disabled={loading}
            type="button"
            onClick={() => {
              if (
                window.confirm('Are you sure you want to delete this item?')
              ) {
                deleteItem()
              }
            }}
          >
            {children}
          </button>
        )}
      </Mutation>
    )
  }
}

DeleteItem.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
}

DeleteItem.defaultProps = {}

export default DeleteItem
