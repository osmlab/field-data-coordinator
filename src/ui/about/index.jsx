'use strict'
const React = require('react')
const get = require('object-path').get
const { Link } = require('react-router-dom')
const { connect } = require('react-redux')
const { getRecentObservations } = require('../../selectors')
const PropTypes = require('prop-types')
const { nullValue, date, coordinates } = require('../format')
const { SOURCE, markerStyle } = require('../map/config')
const { version, surveyType, device, timestamp } = require('../data/property-names').accessors


class About extends React.Component {

  render () {
    return (
      <div className="body__content">
        <section className='row initialSection section__about'>
          <p>The Observe Desktop App is the hub for mappers to sync surveys, share observations, and export data to OSM. It allows a field manager to manage the surveys that are synced to everyone's phones, as well as examine and filter the observations that mappers make. As a desktop app, it supports both MacOS and Windows environments. Finally, it automatically syncs surveys and observations, once it detects mobile phones that have Observe Mobile on the same wifi connection.</p>
        </section>
        <section className='row section__about'>
          <h3>Getting Started</h3>
          <p>The Observe App comes pre-filled with the standard OSM survey from the iD Editor. This means you don't need to create a custom survey before you can start making observations that can upload to OSM. To upload new surveys, locate the survey YAML file on your local hard drive. Find more information about how to create your own survey <a className='link--primary link--lowercase' href="https://github.com/osmlab/field-data-collection/blob/master/docs/surveys.md">here</a>.</p>
          <img alt='importing surveys' className='img-about' src='./assets/icons/about-surveys.jpg' />

          <p>Once a survey and geographic area have been specified, the mobile app will be ready to use. Simply go to the Surveys tab and "Add a New Survey" in the mobile app to pull the information you've uploaded from the desktop app.</p>
        </section>
        <section className='row section__about'>
          <h3>Receiving Data</h3>
          <p>Once observations have been collected and mobile devices are on the same wifi network as the desktop application, press sync at the top of the "My Observations" page. This will sync all observations to the desktop app, to prevent data loss. Once pressed data will show up on the desktop application, ready to be manipulated and exported to OSM.</p>
        </section>
      </div>
    )
  }
}

module.exports = connect()(About)
