'use strict'

const { ipcRenderer } = require('electron')
const RaisedButton = require('material-ui/RaisedButton').default
const React = require('react')

class UploadSurvey extends React.Component {
  constructor (props) {
    super(props)
    this.import = this.import.bind(this)
  }

  import () {
    ipcRenderer.send('trigger-import-survey-dialog')
  }

  render () {
    return (
      <div>
        <h3>Import a new survey</h3>
        <RaisedButton label='Import' onTouchTap={this.import} />
      </div>
    )
  }
}

module.exports = UploadSurvey
