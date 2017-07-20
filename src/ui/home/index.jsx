'use strict'
const React = require('react')

module.exports = class App extends React.Component {
  render () {
    return (
      <div>
        <section className='page__header row'>
          <h1 className='section__title'>Make surveys, collect data, edit data, export to OSM.</h1>
          <div className='header__content'>
            <div className='header__card'>
              <div className='card__image'></div>
              <h2 className='card__title'>Create Surveys</h2>
              <p className='card__prose'>Create surveys using our formatting in google docs or xcel. Import   yourspreadsheet   and share the link withyour surveyors</p>
              <a className='card__link link--primary'>Create a Survey</a>
            </div>
            <div className='header__card'>
              <div className='card__image'></div>
              <h2 className='card__title'>Collect Surveys</h2>
              <p className='card__prose'>Surveyors can edit OSM information or complete surveys through their andriod devices .</p>
              <a className='card__link link--primary'>Download the App</a>
            </div>
            <div className='header__card'>
              <div className='card__image'></div>
              <h2 className='card__title'>Edit Data</h2>
              <p className='card__prose'>Collected data will sync back to the coordinator app, allowing coordinators to   clean up the data.</p>
              <a className='card__link link--primary'>View Collected Data</a>
            </div>
            <div className='header__card'>
              <div className='card__image'></div>
              <h2 className='card__title'>Export to OSM</h2>
              <p className='card__prose'>Once you’ve cleaned up your data export relevant data back to OSM.</p>
            </div>
          </div>
        </section>
        <section className='page__body row'>
          <h1 className='section__title'>Recently Synced Data</h1>
          <div className='body__content'>
            <div className='data__card'>
              <div className='data__map'>
              </div>
              <div className='data__meta'>
                <h2 className='data__title'>Name of Observation Point</h2>
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
                <p className='data_item'>80% complete</p>
              </div>
            </div>
          </div>
          <a className='link--page link--primary'>View All Data Points</a>
        </section>
      </div>
    )
  }
}
