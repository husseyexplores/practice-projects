import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import Head from 'next/head'
import Link from 'next/link'

import { perPage } from '../config'
import PaginationStyles from './styles/PaginationStyles'

// ----------------------------------------------------------------------------

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`

function Pagination({ page }) {
  return (
    <Query query={PAGINATION_QUERY}>
      {({ data, loading, error }) => {
        if (loading) {
          return <p>Loading...</p>
        }

        if (error) {
          return <p>Error occured while loading paginaiton</p>
        }

        const { count } = data.itemsConnection.aggregate
        const pagesCount = Math.ceil(count / perPage)
        return (
          <>
            <Head>
              <title>
                Sick Fits | Page {page} of {pagesCount}
              </title>
            </Head>

            <PaginationStyles>
              <Link href={{ pathname: '/items', query: { page: page - 1 } }}>
                <a className="prev" aria-disabled={page <= 1}>
                  ← Prev
                </a>
              </Link>
              <p>
                Page {page} of {pagesCount}
              </p>
              <p>{count} Items Total</p>
              <Link href={{ pathname: '/items', query: { page: page + 1 } }}>
                <a className="next" aria-disabled={page >= pagesCount}>
                  Next →
                </a>
              </Link>
            </PaginationStyles>
          </>
        )
      }}
    </Query>
  )
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
}

Pagination.defaultProps = {}

export default Pagination
