'use strict'
const React = require('react')
const Map = require('./Map.jsx')
const Properties = require('./Properties.jsx')

class Observations extends React.Component {
  render () {
    return (
      <div className='content'>
        <Properties />
        <Map />
      </div>
    )
  }
}

module.exports = Observations
