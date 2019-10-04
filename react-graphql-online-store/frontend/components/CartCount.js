import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

// ----------------------------------------------------------------------------

const CountAnimationStyles = styled.span`
  position: relative;
  .count {
    display: block;
    position: relative;
    backface-visibility: hidden;
  }

  /* Entered dot. FROM: flipped */
  .count-enter {
    transform: rotateX(0.5turn);
  }
  /* Entered dot. TO: normal */
  .count-enter-active {
    transform: rotateX(0);
    transition: all 5000ms;
  }

  /* Exited dot. FROM: normal  */
  .count-exit {
    top: 0;
    position: absolute;
    transform: rotateX(0);
  }
  /* Exited dot. TO: Flipped  */
  .count-exit-active {
    transform: rotateX(0.5turn);
    transition: all 5000ms;
  }
`

const Dot = styled.div`
  background: ${({ theme }) => theme.red};
  color: white;
  border-radius: 50%;
  padding: 0.5rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
`

function CartCount({ count }) {
  return (
    <CountAnimationStyles>
      <TransitionGroup>
        <CSSTransition
          className="count"
          classNames="count"
          key={count}
          timeout={5000}
          unmountOnExit
        >
          <Dot>{count}</Dot>
        </CSSTransition>
      </TransitionGroup>
    </CountAnimationStyles>
  )
}

CartCount.propTypes = {
  count: PropTypes.number.isRequired,
}

CartCount.defaultProps = {}

export default CartCount
