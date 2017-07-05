'use strict'

const dragDrop = require('drag-drop')
const React = require('react')
const { connect } = require('react-redux')

const ImportSurvey = require('./Import.jsx')
const { getSurveys } = require('../../selectors')


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
  render () {
    const { surveys } = this.props

    // TODO wire up drag-drop to allow surveys to be dragged in
    return (
      <div className='row'>
        <section className='initialSection'>
          <h2>Surveys</h2>
          {surveys && surveys.size > 0
            ? <div>
              <h3>Available Surveys</h3>
              <ul>
                {surveys.map((survey, id) => <li key={id}>{survey.name}</li>)}
              </ul>
            </div>
            :}
            <ImportSurvey />
        </section>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  surveys: getSurveys(state)
})

module.exports = connect(mapStateToProps)(Surveys)
