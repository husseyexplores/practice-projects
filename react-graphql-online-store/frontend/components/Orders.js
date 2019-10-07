import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { formatDistance } from 'date-fns'
import styled from 'styled-components'
import formatMoney from '../lib/formatMoney'

import ErrorMessage from './ErrorMessage'
import OrderItemStyles from './styles/OrderItemStyles'

// ----------------------------------------------------------------------------

const GET_ORDERS_QUERY = gql`
  query GET_ORDERS_QUERY {
    orders {
      id
      total
      createdAt
      items {
        quantity
      }
    }
  }
`

const OrdersList = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`

function countOrderItems(order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

function Orders() {
  return (
    <Query query={GET_ORDERS_QUERY}>
      {({ data, error, loading }) => {
        if (error) {
          return <ErrorMessage error={error} />
        }

        if (loading) {
          return <p>Loading...</p>
        }

        const { orders } = data
        const ordersCount = orders.length
        return (
          <div>
            <h2>
              You have {ordersCount} order{ordersCount === 1 ? '' : 's'}
            </h2>
            <OrdersList>
              {orders.map(order => (
                <OrderItemStyles key={order.id}>
                  <Link href={{ pathname: '/order', query: { id: order.id } }}>
                    <a>
                      <div className="order-meta">
                        <p>{countOrderItems(order)} Items</p>
                        <p>{order.items.length} Products</p>
                        <p>
                          {formatDistance(
                            new Date(order.createdAt),
                            new Date()
                          )}
                        </p>
                        <p>{formatMoney(order.total)}</p>
                      </div>
                    </a>
                  </Link>
                </OrderItemStyles>
              ))}
            </OrdersList>
          </div>
        )
      }}
    </Query>
  )
}

Orders.propTypes = {}

Orders.defaultProps = {}

export default Orders
