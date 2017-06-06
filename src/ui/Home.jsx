'use strict'
const React = require('react')
const Header = require('./Header.jsx')
const Map = require('./Map.jsx')

module.exports = class App extends React.Component {
  render () {
    return (
      <div>
        <Header />
        <Map />
      </div>
    )
  }
}
