'use strict'
const React = require('react')
const { Link } = require('react-router-dom')
const ObservationMap = require('./Observation-Map.jsx')
const Properties = require('./Properties.jsx')
const Export = require('./Export.jsx')

class Observations extends React.Component {
  render () {
    return (
      <div className='content'>
        <Properties />
        <div className='contentMain'>
          <div className='clearfix'>
            <h2 className='floatElementLeft'>Data</h2>
            <Export />
          </div>
          <ul className='navTabs'>
            <li className='navTabsElement'>
              <Link to='' className=''>Map</Link>
            </li>
            <li className='navTabsElement'>
              <Link to='' className=''>Table</Link>
            </li>
          </ul>
          <ObservationMap />
        </div>
      </div>
    )
  }
}

module.exports = Observations
