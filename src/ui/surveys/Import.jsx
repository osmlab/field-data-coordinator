'use strict'

const React = require('react')
const { connect } = require('react-redux')
const { Link } = require('react-router-dom')

const { importSurvey } = require('../../actions')

class Import extends React.Component {
  render () {
    const { importSurvey } = this.props

    return (
      <div className='surveyInput'>
        <h3 className='withDescription'>Add new survey details</h3>
        <p className='description'>Only surveys that are in a YAML format can be imported. More information on how to format or modify an existing YAML file can be found on the <Link to='/about' className='link--primary link--lowercase'>about page</Link> or <a className='link--primary link--lowercase' href="https://github.com/osmlab/field-data-collection/blob/master/docs/surveys.md">here</a>.</p>
        <button className='button buttonGroup' onClick={importSurvey}>Import Existing Survey</button>
      </div>
    )
  }
}

module.exports = connect(null, { importSurvey })(Import)
