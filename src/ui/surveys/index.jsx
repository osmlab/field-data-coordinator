'use strict'

const dragDrop = require('drag-drop')
const { ipcRenderer } = require('electron')
const React = require('react')

const ImportSurvey = require('./Import.jsx')

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

module.exports = class Surveys extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      surveys: []
    }
  }

  componentWillMount () {
    ipcRenderer.send('list-surveys')
    ipcRenderer.send('subscribe-to-survey-list-updates')

    ipcRenderer.on('receive-survey-list', (evt, surveys) =>
      this.setState({
        surveys
      })
    )
  }

  componentWillUmount () {
    ipcRenderer.send('unsubscribe-from-survey-list-updates')
  }

  render () {
    const { surveys } = this.state

    // TODO wire up drag-drop to allow surveys to be dragged in
    return (
      <div>
        {surveys && surveys.length > 0
          ? <div>
            <h3>Available Surveys</h3>
            <ul>
              {surveys.map((filename, id) => <li key={id}>{filename}</li>)}
            </ul>
          </div>
          : <p>Please import some surveys</p>}
        <ImportSurvey />

      </div>
    )
  }
}
