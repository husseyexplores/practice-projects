import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import RemoveFromCart from './RemoveFromCart'
import formatMoney from '../lib/formatMoney'

// ----------------------------------------------------------------------------

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.lightGrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;

  img {
    margin-right: 1rem;
  }

  h3,
  p {
    margin: 0;
  }
`

function CartItem({ cartItem }) {
  const { id, quantity, item } = cartItem

  if (!item) {
    return (
      <CartItemStyles>
        <p>Item has been deleted.</p>
        <RemoveFromCart id={id} />
      </CartItemStyles>
    )
  }

  const { title, price, image } = item
  const formattedPrice = formatMoney(price)
  const formattedTotalPrice = formatMoney(price * quantity)
  return (
    <CartItemStyles>
      <img width="100" src={image} alt={title} />
      <div className="cart-item-details">
        <h3>{title}</h3>
        <p>
          {formattedTotalPrice}
          {' - '}
          <em>
            {quantity} &times; {formattedPrice} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={id} />
    </CartItemStyles>
  )
}

CartItem.propTypes = {
  cartItem: PropTypes.shape({
    id: PropTypes.string,
    quantity: PropTypes.number,
    item: PropTypes.object,
  }).isRequired,
}

CartItem.defaultProps = {}

export default CartItem
