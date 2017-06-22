'use strict'
const React = require('react')
const { Link } = require('react-router-dom')
const Metadata = require('./Metadata.jsx')
const ObservationMap = require('./Observation-Map.jsx')

class Observation extends React.Component {
  render () {
    const { params } = this.props.match
    return (
      <div>
        <Link to='/data'>Back to all observations</Link>
        <p>Observation ID: {params.observationId}</p>
        <p><span>Updated: TODO</span> | <span>Author: TODO</span></p>
        <div className='content'>
          <Metadata />
          <ObservationMap observationId={params.observationId} />
        </div>
      </div>
    )
  }
}

module.exports = Observation
