'use strict'
const React = require('react')
const Observations = require('./observations.jsx')
const Observation = require('./observation.jsx')
const { Route } = require('react-router-dom')

module.exports = class Data extends React.Component {
  render () {
    const { match } = this.props
    return (
      <div>
        <Route path={`${match.url}/observation/:observationId`} component={Observation} />
        <Route exact path={match.url} component={Observations} />
      </div>
    )
  }
}
