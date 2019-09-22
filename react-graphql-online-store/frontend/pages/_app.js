import NextApp from 'next/app'
import Page from '../components/Page'

// ----------------------------------------------------------------------------

class App extends NextApp {
  render() {
    const { Component } = this.props
    return (
      <Page>
        <Component />
      </Page>
    )
  }
}

export default App
