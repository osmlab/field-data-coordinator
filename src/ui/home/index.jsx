'use strict'
const React = require('react')
const moment = require('moment')
const { Link } = require('react-router-dom')
const { connect } = require('react-redux')
const { getRecentObservations } = require('../../selectors')
const PropTypes = require('prop-types')

const NUM_OBSERVATIONS_TO_SHOW = 6

const formatDate = timestamp => moment(timestamp).format('MM/DD/YY')

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
            <dd className='meta-card__def'>{formatDate(properties._timestamp)}</dd>
          </dl>
        </div>
      </div>
    )
  }

  render () {
    return (
      <div>
        <section className='page__header row'>
          <h1 className='section__title'>Make surveys, collect data, edit data, export to OSM.</h1>
          <div className='header__content'>
            <div className='header__card'>
              <div className='card__image' />
              <h2 className='card__title'>Create Surveys</h2>
              <p className='card__prose'>Create surveys using our formatting in google docs or xcel. Import   yourspreadsheet   and share the link withyour surveyors</p>
              <a className='card__link link--primary'>Create a Survey</a>
            </div>
            <div className='header__card'>
              <div className='card__image' />
              <h2 className='card__title'>Collect Surveys</h2>
              <p className='card__prose'>Surveyors can edit OSM information or complete surveys through their andriod devices .</p>
              <a className='card__link link--primary'>Download the App</a>
            </div>
            <div className='header__card'>
              <div className='card__image' />
              <h2 className='card__title'>Edit Data</h2>
              <p className='card__prose'>Collected data will sync back to the coordinator app, allowing coordinators to   clean up the data.</p>
              <a className='card__link link--primary'>View Collected Data</a>
            </div>
            <div className='header__card'>
              <div className='card__image' />
              <h2 className='card__title'>Export to OSM</h2>
              <p className='card__prose'>Once you’ve cleaned up your data export relevant data back to OSM.</p>
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
