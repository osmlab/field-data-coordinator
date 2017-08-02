'use strict'

const dragDrop = require('drag-drop')
const React = require('react')
const { connect } = require('react-redux')
const objectPath = require('object-path')

const ImportSurvey = require('./Import.jsx')
const SelectGeography = require('./Select-Geography.jsx')
const CurrentSelection = require('./Current-Selection.jsx')
const Modal = require('../Modal.jsx')
const { getSurveys } = require('../../selectors')
const { displayCase } = require('../format')
const { removeSurvey } = require('../../actions')

// TODO this doesn't work yet
dragDrop('#root', {
  onDrop: function (files, pos) {
    console.log('dropped files:', files)
  },
  onDragEnter: function () {
    console.log('onDragEnter')
  },
  onDragOver: function () {
    console.log('onDragOver')
  },
  onDragLeave: function () {
    console.log('onDragLeave')
  }
})

class Surveys extends React.Component {
  constructor (props) {
    super(props)
    this.removeSurvey = this.removeSurvey.bind(this)
    this.renderSurvey = this.renderSurvey.bind(this)
    this.state = { surveyToRemove: null }
  }

  removeSurvey () {
    this.props.removeSurvey(this.state.surveyToRemove)
    this.setState({ surveyToRemove: null })
  }

  renderSurvey (survey) {
    const meta = objectPath.get(survey, 'meta', {})
    const { id } = survey
    return (
      <div key={id} className='surveyMeta'>
        <h4>{survey.name}</h4>
        <p>{survey.description}</p>
        {Object.keys(meta).map(key => <p key={key}>
          <span className='data__tag'>{displayCase(key)}: </span>
          {displayCase(meta[key])}
        </p>
        )}
        <p><span className='data__tag'>Version:</span> {survey.version}</p>
        <div className='link--group'>
          <a className='link--primary link--delete' onClick={() => this.setState({ surveyToRemove: id })}>Delete</a>
        </div>
      </div>
    )
  }

  render () {
    const { surveys } = this.props

    // TODO wire up drag-drop to allow surveys to be dragged in
    return (
      <div className='row'>
        <section className='initialSection'>
          <h2>Surveys</h2>
          <div className='surveyInputs'>
            <ImportSurvey />
          </div>
          {surveys && surveys.size > 0 ? (
            <div className='clearfix'>
              <h4 className='subtitle'>Imported Surveys</h4>
              <div className='importedSurvey'>
                {surveys.map(this.renderSurvey)}
              </div>
            </div>
          ) : null
          }
          <div className='surveyInputs'>
            <SelectGeography />
          </div>
          <CurrentSelection />
        </section>
        { this.state.surveyToRemove ? (
          <Modal className='smallModal'>
            <div className='confirmRemove'>
              <p>This will delete {this.state.surveyToRemove}. You will have to reupload this survey to use it again.</p>
              <div className='confirmButtons'>
                <button onClick={this.removeSurvey}>Confirm</button>
                <button onClick={() => this.setState({ surveyToRemove: null })}>Cancel</button>
              </div>
            </div>
          </Modal>
        ) : null }
      </div>
    )
  }
}

const mapStateToProps = state => ({
  surveys: getSurveys(state)
})

module.exports = connect(mapStateToProps, { removeSurvey })(Surveys)
