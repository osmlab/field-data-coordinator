'use strict'
const React = require('react')

class Observation extends React.Component {
  render () {
    const { params } = this.props.match
    return (
      <div>{params.observationId}</div>
    )
  }
}

module.exports = Observation
