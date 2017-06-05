'use strict'
const React = require('react')
const Header = require('./Header.jsx')

module.exports = class App extends React.Component {
  render () {
    return (
      <div>
        <Header />
        <h1>Hello world!</h1>
      </div>
    )
  }
}
