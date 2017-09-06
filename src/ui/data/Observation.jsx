'use strict'
const React = require('react')
const { Link } = require('react-router-dom')
const { connect } = require('react-redux')
const get = require('object-path').get
const Metadata = require('./Metadata.jsx')
const ObservationMap = require('./Observation-Map.jsx')
const { getSingleObservationById } = require('../../selectors')
const { nullValue, date, coordinates } = require('../format')
const { device, timestamp } = require('./property-names').accessors

class Observation extends React.Component {
  render () {
    const { params } = this.props.match
    const { observation } = this.props
    if (!observation) return null
    const { properties } = observation
    return (
      <div className='row'>
        <div className='observation__header'>
          <Link className='link--primary' to='/data'>Back to all observations</Link>
          <h2 className='observation__title'>Observation ID: {params.observationId}</h2>
          <ul className='data__list'>
            <li className='data__item'>Location: {coordinates(get(observation, 'geometry.coordinates'))}</li>
            <li className='data__item'>Type: Observation</li>
          </ul>
          <dl className='meta-card__list'>
            <dt className='meta-card__title'>Device ID:</dt>
            <dd className='meta-card__def'>{get(properties, device, nullValue)}</dd>
            <dt className='meta-card__title'>Date:</dt>
            <dd className='meta-card__def'>{date(get(properties, timestamp, nullValue))}</dd>
          </dl>
        </div>
        <div className='content observation__content'>
          <Metadata observation={observation} />
          <ObservationMap observationId={params.observationId} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { params } = ownProps.match
  const id = params.observationId
  return {
    observation: getSingleObservationById(state, id)
  }
}

module.exports = connect(mapStateToProps)(Observation)
