import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Downshift from 'downshift'
import Router from 'next/router'
import { ApolloConsumer } from 'react-apollo'
import gql from 'graphql-tag'
import debounce from 'lodash.debounce'

import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown'

// ----------------------------------------------------------------------------

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: { id: item.id },
  })
}

class Search extends Component {
  state = { items: [], loading: false, searchTerm: '' }

  client = null

  /* eslint-disable react/sort-comp */

  handleOnChange = searchTerm => {
    this.setState({ searchTerm })
    if (searchTerm.length) {
      this.setState({ loading: true })
      this.runSearchQueryDebounced()
    }
  }

  runSearchQuery = async () => {
    const { searchTerm } = this.state
    const { client } = this

    // Set the loading flag
    this.setState({ loading: true })

    // Run the query
    const { data } = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm },
    })

    // Update the state with the new data
    this.setState({ loading: false, items: data.items })
  }

  runSearchQueryDebounced = debounce(this.runSearchQuery, 500)

  render() {
    const { searchTerm, items, loading } = this.state

    return (
      <SearchStyles>
        <Downshift
          itemToString={item => (item === null ? '' : item.title)}
          onChange={routeToItem}
          inputValue={searchTerm}
        >
          {({
            openMenu,
            getInputProps,
            getItemProps,
            isOpen,
            highlightedIndex,
            inputValue,
          }) => (
            <div>
              {/* Search Input */}
              <ApolloConsumer>
                {client => {
                  // Save the client into a local variable so we can access it later
                  this.client = client

                  return (
                    <input
                      {...getInputProps({
                        type: 'search',
                        onFocus: openMenu,
                        onChange: e => {
                          const { value } = e.target
                          this.handleOnChange(value)
                        },
                        placeholder: 'Search for an item',
                        className: loading ? 'loading' : '',
                      })}
                    />
                  )
                }}
              </ApolloConsumer>

              {/* Dropdown */}
              {loading && <p>Searching...</p>}
              {isOpen && !loading && inputValue && (
                <DropDown>
                  {searchTerm.length > 0 && items.length === 0 && (
                    <p>No items found.</p>
                  )}
                  {items.length > 0 &&
                    items.map((item, idx) => (
                      <DropDownItem
                        {...getItemProps({ item })}
                        key={item.id}
                        highlighted={highlightedIndex === idx}
                      >
                        <img src={item.image} width="50" alt={item.title} />
                        {item.title}
                      </DropDownItem>
                    ))}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    )
  }
}

Search.propTypes = {}

Search.defaultProps = {}

export default Search
