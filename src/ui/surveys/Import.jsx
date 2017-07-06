'use strict'

const React = require('react')
const { connect } = require('react-redux')

const { importSurvey } = require('../../actions')

class Import extends React.Component {
  render () {
    const { importSurvey } = this.props

    return (
      <div>
        <div className='surveyNew'>
          <h4>Add new survey details</h4>
          <button className='button buttonGroup' onClick={importSurvey}>Import Existing Survey</button>
        </div>
      </div>
    )
  }
}

module.exports = connect(null, { importSurvey })(Import)
