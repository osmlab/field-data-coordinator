'use strict'
const React = require('react')
const RaisedButton = require('material-ui/RaisedButton').default
const { ipcRenderer } = require('electron')

class UploadSurvey extends React.Component {
  constructor (props) {
    super(props)
    this.upload = this.upload.bind(this)
  }

  upload () {
    ipcRenderer.send('upload-survey')
  }

  render () {
    return (
      <div>
        <h3>Upload a new survey spreadsheet</h3>
        <RaisedButton label='Upload' onTouchTap={this.upload} />
      </div>
    )
  }
}

module.exports = UploadSurvey
