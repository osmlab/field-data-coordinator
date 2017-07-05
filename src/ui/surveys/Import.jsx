'use strict'

const React = require('react')
const { connect } = require('react-redux')

const { importSurvey } = require('../../actions')

class Import extends React.Component {
  render () {
    const { importSurvey } = this.props

    return (
      <div>
        <h4>Add a new survey</h4>
        <button onClick={importSurvey}>Import Existing Survey</button>
        <button onClick={importSurvey}>Build a New Survey</button>
      </div>
    )
  }
}

module.exports = connect(null, { importSurvey })(Import)
