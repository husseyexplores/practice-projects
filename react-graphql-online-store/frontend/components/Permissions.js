import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { makeMap } from '../lib/helpers'

import Table from './styles/Table'
import Button from './styles/SickButton'
import ErrorMessage from './ErrorMessage'

// ----------------------------------------------------------------------------

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      email
      name
      permissions
    }
  }
`

const ALL_POSSIBLE_PERMISSIONS = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
]

function Permissions() {
  return (
    <Query query={ALL_USERS_QUERY}>
      {({ data, error, loading, called }) => {
        if (loading || !called) {
          return <p>Loading users...</p>
        }

        if (error) {
          return <ErrorMessage error={error} />
        }

        return (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {ALL_POSSIBLE_PERMISSIONS.map(p => (
                  <th key={p}>{p}</th>
                ))}
                <th>👇</th>
              </tr>
            </thead>

            <tbody>
              {data.users.map(user => (
                <UserPermissions user={user} key={user.id} />
              ))}
            </tbody>
          </Table>
        )
      }}
    </Query>
  )
}

Permissions.propTypes = {}

Permissions.defaultProps = {}

// Each user row component
const UPDATE_USER_MUTATION = gql`
  mutation UPDATE_USER_MUTATION(
    $data: UserUpdateInput!
    $where: UserWhereUniqueInput!
  ) {
    updateUser(data: $data, where: $where) {
      id
      email
      name
      permissions
    }
  }
`
class UserPermissions extends Component {
  state = {
    permissions: this.props.user.permissions,
  }

  handleChange = ({ target: { checked, value: permission } }) => {
    // If checkbox is checked, add the permission to the state
    if (checked) {
      this.setState(state => ({
        permissions: [...state.permissions, permission],
      }))
    } else {
      // otherwise remove the permission from the state
      this.setState(state => ({
        permissions: state.permissions.filter(p => p !== permission),
      }))
    }
  }

  onMutationComplete = data => {
    this.setState({
      permissions: data.updateUser.permissions,
    })
  }

  render() {
    const { user } = this.props
    const { permissions } = this.state

    const userPermissionsMap = makeMap(permissions)

    return (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {ALL_POSSIBLE_PERMISSIONS.map(p => (
          <td key={`${user.id}__${p}`}>
            <label htmlFor={`${user.id}__permission__${p}`}>
              <input
                id={`${user.id}__permission__${p}`}
                name={`${user.id}__permissionsCheckbox`}
                type="checkbox"
                checked={Boolean(userPermissionsMap[p])}
                onChange={this.handleChange}
                value={p}
              />
            </label>
          </td>
        ))}
        <td>
          <Mutation
            mutation={UPDATE_USER_MUTATION}
            onCompleted={this.onMutationComplete}
          >
            {(updateUserMutation, { loading }) => (
              <Button
                type="button"
                disabled={loading}
                onClick={() => {
                  updateUserMutation({
                    variables: {
                      where: { id: user.id },
                      data: {
                        permissions: {
                          set: this.state.permissions,
                        },
                      },
                    },
                  })
                }}
              >
                Updat{loading ? 'ing' : 'e'}
              </Button>
            )}
          </Mutation>
        </td>
      </tr>
    )
  }
}

UserPermissions.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    name: PropTypes.string,
    permissions: PropTypes.array,
  }).isRequired,
}

export default Permissions
