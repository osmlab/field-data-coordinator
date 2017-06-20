'use strict'
const React = require('react')
const Map = require('./Map.jsx')
const Sidebar = require('./Sidebar.jsx')

module.exports = class Data extends React.Component {
  render () {
    return (
      <div className='content'>
        <Sidebar />
        <Map />
      </div>
    )
  }
}
