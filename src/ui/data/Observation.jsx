'use strict'
const React = require('react')
const { Link } = require('react-router-dom')
const Metadata = require('./Metadata.jsx')
const ObservationMap = require('./Observation-Map.jsx')

class Observation extends React.Component {
  render () {
    const { params } = this.props.match
    return (
      <div className='row'>
        <div className='observation__header'>
          <Link className='link--primary' to='/data'>Back to all observations</Link>
          <h2 className='observation__title'>Observation ID: {params.observationId}</h2>
          <ul className='data__list'>
            <li className='data__item'>49° N 100° E</li>
            <li className='data__item'>Category</li>
          </ul>
          <dl className='meta-card__list'>
            <dt className='meta-card__title'>Author:</dt>
            <dd className='meta-card__def'>Author Name</dd>
            <dt className='meta-card__title'>Date:</dt>
            <dd className='meta-card__def'>2/26/17</dd>
          </dl>
        </div>
        <div className='content observation__content'>
          <Metadata />
          <ObservationMap observationId={params.observationId} />
        </div>
      </div>
    )
  }
}

module.exports = Observation
