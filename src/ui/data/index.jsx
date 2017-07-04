'use strict'
const React = require('react')
const Observations = require('./Observations.jsx')
const Observation = require('./Observation.jsx')

const { Route } = require('react-router-dom')

module.exports = class Data extends React.Component {
  render () {
    const { match } = this.props
    return (
      <div className='dataWrapper'>
        <div className='sidebarSidebar'></div>
        <div className='row'>
          <Route path={`${match.url}/observation/:observationId`} component={Observation} />
          <Route exact path={match.url} component={Observations} />
        </div>
      </div>
    )
  }
}
