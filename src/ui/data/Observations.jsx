'use strict'
const React = require('react')
const ObservationMap = require('./Observation-Map.jsx')
const Properties = require('./Properties.jsx')

class Observations extends React.Component {
  render () {
    return (
      <div className='content'>
        <Properties />
        <ObservationMap />
      </div>
    )
  }
}

module.exports = Observations
