import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import Head from 'next/head'
import styled from 'styled-components'

import ErrorMessage from './ErrorMessage'
import { SINGLE_ITEM_QUERY } from './UpdateItem'

// ----------------------------------------------------------------------------

const SingleItemStyles = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 3rem;
  box-shadow: ${({ theme }) => theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;

  img {
    width: 100%;
    /* height: 100%; */
    object-fit: contain;
  }

  .details {
    margin-left: 3rem;
    font-size: 2rem;
  }
`

class SingleItem extends Component {
  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading, error }) => {
          if (loading) {
            return <p>Loading...</p>
          }

          if (error) {
            return (
              <>
                <Head>
                  <title>Sick Fits | Unexpected Error</title>
                </Head>
                <ErrorMessage error={error} />
              </>
            )
          }
          const { item } = data
          if (!item) {
            const err = new Error('Item not found')
            return (
              <>
                <Head>
                  <title>Sick Fits | Not Found</title>
                </Head>
                <ErrorMessage error={err} />
              </>
            )
          }

          const { largeImage, title, price, description } = item
          return (
            <SingleItemStyles>
              <Head>
                <title>Sick Fits | {title}</title>
              </Head>
              <img src={largeImage} alt={title} />
              <div className="details">
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </SingleItemStyles>
          )
        }}
      </Query>
    )
  }
}

SingleItem.propTypes = {
  id: PropTypes.string.isRequired,
}

SingleItem.defaultProps = {}

export default SingleItem
