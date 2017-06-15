'use strict'
const React = require('react')
const UploadSurvey = require('./Upload.jsx')

module.exports = class Surveys extends React.Component {
  render () {
    return (
      <div>
        <UploadSurvey />

      </div>
    )
  }
}
