'use strict'
const React = require('react')
const Map = require('./Map.jsx')

class Observation extends React.Component {
  render () {
    const { params } = this.props.match
    return (
      <div>
        <p>Observation ID: {params.observationId}</p>
        <Map observationId={params.observationId} />
      </div>

    )
  }
}

module.exports = Observation
