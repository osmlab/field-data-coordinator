'use strict'

const RaisedButton = require('material-ui/RaisedButton').default
const React = require('react')
const { connect } = require('react-redux')

const { importSurvey } = require('../../actions')

class Import extends React.Component {
  render () {
    const { importSurvey } = this.props

    return (
      <div>
        <h3>Import a new survey</h3>
        <RaisedButton label='Import' onTouchTap={importSurvey} />
      </div>
    )
  }
}

module.exports = connect(null, { importSurvey })(Import)
