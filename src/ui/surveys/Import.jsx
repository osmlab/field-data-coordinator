'use strict'

const React = require('react')
const { connect } = require('react-redux')

const { importSurvey } = require('../../actions')

class Import extends React.Component {
  render () {
    const { importSurvey } = this.props

    return (
      <div className='surveyInput'>
        <h3 className='withDescription'>Add new survey details</h3>
        <p className='description'>Description of how to add things. Find more information about how to make a survey file here.</p>
        <button className='button buttonGroup' onClick={importSurvey}>Import Existing Survey</button>
      </div>
    )
  }
}

module.exports = connect(null, { importSurvey })(Import)
