import withApollo from 'next-with-apollo'
import ApolloClient from 'apollo-boost'
import { endpoint } from '../config'

import { LOCAL_STATE_QUERY } from '../components/Cart'

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      })
    },
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart(_, variables, client) {
            const { cache } = client
            // 1. Read the cartOpen value from cache
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY,
            })
            // 2. Update the cart state
            const data = { data: { cartOpen: !cartOpen } }
            cache.writeData(data)
            return data
          },
        },
      },
      defaults: {
        cartOpen: false,
      },
    },
  })
}

export default withApollo(createClient)
