'use strict'
const React = require('react')
const ObservationMap = require('./Observation-Map.jsx')
const Properties = require('./Properties.jsx')
const Export = require('./Export.jsx')

class Observations extends React.Component {
  render () {
    return (
      <div className='content'>
        <Properties />
        <div className='contentMain'>
          <h3>Data</h3>
          <Export />
          <ObservationMap />
        </div>
      </div>
    )
  }
}

module.exports = Observations
