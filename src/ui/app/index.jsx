'use strict'

const React = require('react')

const Header = require('./Header.jsx')

module.exports = class App extends React.Component {
  render () {
    return (
      <div>
        <Header />
        <main role='main' className='main, row'>
          {this.props.children}
        </main>
      </div>
    )
  }
}
