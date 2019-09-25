import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'

import Item from './Item'

// ----------------------------------------------------------------------------

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY {
    items {
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
    return (
      <Centered>
        Items
        <Query query={ALL_ITEMS_QUERY}>
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
                {data.items.map(item => (
                  <Item key={item.id} item={item} />
                ))}
              </ItemsList>
            )
          }}
        </Query>
      </Centered>
    )
  }
}

Items.propTypes = {}

Items.defaultProps = {}

export default Items
export { ALL_ITEMS_QUERY }
