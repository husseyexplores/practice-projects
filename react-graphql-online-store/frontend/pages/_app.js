import NextApp, { Container } from 'next/app'
import Page from '../components/Page'

class App extends NextApp {
  render() {
    const { Component } = this.props
    return (
      <Container>
        <Page>
          <Component />
        </Page>
      </Container>
    )
  }
}

export default App
