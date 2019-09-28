import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'

import Item from './Item'
import Pagination from './Pagination'
import { perPage } from '../config'

// ----------------------------------------------------------------------------

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`

const Centered = styled.div`
  text-align: center;
`

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 6rem;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
`

class Items extends Component {
  render() {
    const { page } = this.props

    return (
      <Centered>
        <Pagination page={page} />
        <Query
          query={ALL_ITEMS_QUERY}
          variables={{ skip: page * perPage - perPage }}
        >
          {({ data, loading, error }) => {
            if (loading) {
              return <p>Loading...</p>
            }
            if (error) {
              return (
                <p>
                  Ooops... An error occured.{' '}
                  {error.message ? error.message : error}
                </p>
              )
            }

            return (
              <ItemsList>
                {data.items.length > 0 &&
                  data.items.map(item => <Item key={item.id} item={item} />)}

                {/* no items message */}
                {data.items.length < 1 && page === 1 && <p>No items found</p>}
                {data.items.length < 1 && page > 1 && (
                  <p>No items found on page {page}</p>
                )}
              </ItemsList>
            )
          }}
        </Query>
        <Pagination page={page} />
      </Centered>
    )
  }
}

Items.propTypes = {
  page: PropTypes.number.isRequired,
}

Items.defaultProps = {}

export default Items
export { ALL_ITEMS_QUERY }
