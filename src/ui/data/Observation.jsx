'use strict'
const React = require('react')
const { Link } = require('react-router-dom')
const Map = require('./Map.jsx')

class Observation extends React.Component {
  render () {
    const { params } = this.props.match
    return (
      <div>
        <Link to='/data'>Back to all observations</Link>
        <p>Observation ID: {params.observationId}</p>
        <Map observationId={params.observationId} />
      </div>

    )
  }
}

module.exports = Observation
