import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'

import Error from './ErrorMessage'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'

// ----------------------------------------------------------------------------

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION($data: ItemInput!) {
    createItem(data: $data) {
      id
      title
      description
      price
      image
      largeImage
    }
  }
`
class CreateItem extends Component {
  /* eslint-disable react/no-unused-state */
  state = {
    data: { title: '', description: '', image: '', largeImage: '', price: 0 },
    loading: false,
    error: null,
  }

  fileRef = React.createRef()

  handleChange = ({ target: { value, name, type } }) => {
    const val = type === 'number' ? parseFloat(value) : value
    this.setState(state => ({
      ...state,
      data: { ...state.data, [name]: val },
    }))
  }

  uploadFile = () =>
    new Promise(async (resolve, reject) => {
      const { files } = this.fileRef.current
      if (!files || files.length === 0) {
        return reject(new Error('Please select an image'))
      }

      const data = new FormData()
      data.append('file', files[0])
      data.append('upload_preset', 'sickfits')
      try {
        this.setState({ loading: true })
        const response = await fetch(
          'https://api.cloudinary.com/v1_1/husseyexplores/image/upload',
          {
            method: 'POST',
            body: data,
          }
        )
        const file = await response.json()
        this.setState(
          state => ({
            data: {
              ...state.data,
              image: file.secure_url,
              largeImage: file.eager[0].secure_url,
            },
            loading: false,
            error: null,
          }),
          () => {
            // image is uploaded, state is also updated
            resolve()
          }
        )
      } catch (error) {
        return reject(error)
      }
    })

  render() {
    const { data, loading: uploadingFile } = this.state
    const { title, description, price, image } = data

    return (
      <Mutation mutation={CREATE_ITEM_MUTATION}>
        {(createItem, { loading, error }) => (
          <Form
            onSubmit={async e => {
              e.preventDefault()

              // Upload the image
              await this.uploadFile()

              // Call the mutation
              const response = await createItem({
                variables: { data: this.state.data },
              })

              // Redirect to the item page
              // Router.push({
              //   pathname: '/item',
              //   query: { id: response.data.createItem.id },
              // })
            }}
          >
            <Error error={error} />
            <fieldset
              disabled={loading || uploadingFile}
              aria-busy={loading || uploadingFile}
            >
              <label htmlFor="file">
                Image
                <input
                  ref={this.fileRef}
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                  // value={image}
                />
                {image && <img width="200" src={image} alt="Upload preview" />}
              </label>

              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={title}
                  onChange={this.handleChange}
                />
              </label>

              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={price}
                  min="0"
                  onChange={this.handleChange}
                />
              </label>

              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter A Description"
                  required
                  value={description}
                  onChange={this.handleChange}
                />
              </label>

              <button type="submit">Create Item</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

CreateItem.propTypes = {}

CreateItem.defaultProps = {}

export default CreateItem
export { CREATE_ITEM_MUTATION }
