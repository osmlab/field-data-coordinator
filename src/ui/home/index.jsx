'use strict'
const React = require('react')
const moment = require('moment')
const { Link } = require('react-router-dom')
const { connect } = require('react-redux')
const { getRecentObservations } = require('../../selectors')
const PropTypes = require('prop-types')
const { date } = require('../format')

const NUM_OBSERVATIONS_TO_SHOW = 6

class App extends React.Component {
  renderObservation (ob) {
    const { id, properties } = ob
    return (
      <div className='data__card' key={properties._version_id}>
        <div className='data__map' />
        <div className='data__meta'>
          <Link to={`data/observations/${id}`}><h2 className='data__title'>ID: {id}</h2></Link>
          <ul className='data__list'>
            <li className='data__item'>{ob.geometry.coordinates.join(', ')}</li>
            <li className='data__item'>Category</li>
          </ul>
          <dl className='meta-card__list'>
            <dt className='meta-card__title'>Device ID:</dt>
            <dd className='meta-card__def'>{properties._device_id}</dd>
            <dt className='meta-card__title'>Date:</dt>
            <dd className='meta-card__def'>{date(properties._timestamp)}</dd>
          </dl>
        </div>
      </div>
    )
  }

  render () {
    return (
      <div>
        <section className='page__header row'>
          <h1 className='section__title withDescription'>Make surveys, collect observations, and export to OSM!</h1>
          <p className='text--centered section__title--description--home'>New to Observe? Be sure to check out our about page for a complete overview of the product or follow the steps below.</p>
          <div className='header__content clearfix'>
            <div className='header__card'>
              <Link to='/surveys'><img alt='add spreadsheet icon' className='card__image' src='./assets/icons/coordinator-icon-add.svg' /></Link>
              <h2 className='card__title'><Link to='/surveys'>Create Surveys</Link></h2>
              <p className='card__prose'>Create surveys using our YML template. Import your survey and share the link with your surveyors android devices.</p>
              <Link to='/surveys' className='card__link link--primary'>Create a Survey</Link>
            </div>
            <div className='header__card'>
              <Link to='/data'><img alt='edit map points icon' className='card__image' src='./assets/icons/coordinator-icon-edit.svg' /></Link>
              <h2 className='card__title'><Link to='/data'>Collect & Edit Data</Link></h2>
              <p className='card__prose'>See and edit incoming data, that's been synced from surveyors in the field.</p>
              <Link to='/data' className='card__link link--primary'>View Collected Observations</Link>
            </div>
            <div className='header__card'>
              <Link to='/data'><img alt='map export icon' className='card__image' src='./assets/icons/coordinator-icon-export.svg' /></Link>
              <h2 className='card__title'><Link to='/data'>Export to OSM</Link></h2>
              <p className='card__prose'>Done with your collection? Be sure to download your data and upload it to OSM to share
what you’ve learned with the larger community!</p>
              <Link to='/data' className='card__link link--primary'>Export Data</Link>
            </div>
          </div>
        </section>
        <section className='page__body row'>
          <h1 className='section__title'>Recently Synced Data</h1>
          <div className='body__content'>
            {this.props.observations.map(this.renderObservation)}
          </div>
          <Link to='/data' className='link--page link--primary'>View All Data Points</Link>
        </section>
      </div>
    )
  }
}

App.propTypes = {
  observations: PropTypes.array
}

const mapStateToProps = state => {
  return {
    observations: getRecentObservations(NUM_OBSERVATIONS_TO_SHOW)(state)
  }
}
module.exports = connect(mapStateToProps)(App)
