'use strict'

const React = require('react')

const Header = require('./Header.jsx')

module.exports = class App extends React.Component {
  render () {
    return (
      <div>
        <Header />
        <main role='main' className='main'>
          {this.props.children}
        </main>
      </div>
    )
  }
}
