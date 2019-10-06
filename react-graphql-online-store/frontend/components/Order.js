import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { format } from 'date-fns'

import ErrorMessage from './ErrorMessage'
import OrderStyles from './styles/OrderStyles'
import formatMoney from '../lib/formatMoney'

// ----------------------------------------------------------------------------

const GET_ORDER_QUERY = gql`
  query GET_ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      charge
      total
      createdAt
      user {
        id
      }
      items {
        id
        title
        price
        image
        quantity
      }
    }
  }
`

function Order({ id }) {
  return (
    <Query query={GET_ORDER_QUERY} variables={{ id }}>
      {({ data, loading, error }) => {
        if (error) {
          return <ErrorMessage error={error} />
        }

        if (loading) {
          return <p>Fetching order...</p>
        }

        const { order } = data

        return (
          <OrderStyles>
            <Head>
              <title>Sick Fits - Order {order.id}</title>
            </Head>

            <p>
              <span>Order ID: </span>
              <span>{order.id}</span>
            </p>
            <p>
              <span>Charge: </span>
              <span>{order.charge}</span>
            </p>
            <p>
              <span>Date: </span>
              <span>
                {format(new Date(order.createdAt), 'MMMM d, yyyy h:mm a')}
              </span>
            </p>
            <p>
              <span>Total: </span>
              <span>{formatMoney(order.total)}</span>
            </p>
            <p>
              <span>Items count: </span>
              <span>{order.items.length}</span>
            </p>
            <div className="items">
              {order.items.map(item => (
                <div className="order-item" key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <div className="item-details">
                    <h2>{item.title}</h2>
                    <p>Qty: {item.quantity}</p>
                    <p>Each: {formatMoney(item.price)}</p>
                    <p>Subtotal: {formatMoney(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </OrderStyles>
        )
      }}
    </Query>
  )
}

Order.propTypes = {
  id: PropTypes.string.isRequired,
}

Order.defaultProps = {}

export default Order
