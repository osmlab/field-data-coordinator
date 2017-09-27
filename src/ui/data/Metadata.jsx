'use strict'
const React = require('react')
const { connect } = require('react-redux')
const PropTypes = require('prop-types')
const { List } = require('immutable')
const get = require('object-path').get
const { getSurveys } = require('../../selectors')
const { nullValue } = require('../format')
const { accessors, tableHeaders, excludedProperties } = require('./property-names')
const basicInfoTags = tableHeaders.map(t => t[1])

function getSurveyLabel (tag, survey) {
  const { featureTypes } = survey
  for (let i = 0; i < featureTypes.length; ++i) {
    for (let k = 0; k < featureTypes[i].fields.length; ++k) {
      if (featureTypes[i].fields[k].key === tag) {
        return featureTypes[k].fields[k].label
      }
    }
  }
  return false
}

class Metadata extends React.Component {
  renderSurveyTag (tag, survey) {
    // possible that this survey definition was deleted
    if (!survey) {
      return <li key={tag}>{tag}: <strong>{this.props.observation.properties[tag]}</strong></li>
    }
    const label = getSurveyLabel(tag, survey) || tag
    return <li key={tag}>{label}: <strong>{this.props.observation.properties[tag]}</strong></li>
  }

  render () {
    const { observation, surveys } = this.props
    const tags = Object.keys(get(observation, 'properties', {})).filter(t => {
      return basicInfoTags.indexOf(t) === -1 &&
        excludedProperties.indexOf(t) === -1 &&
        typeof observation.properties[t] !== 'undefined'
    })
    const surveyId = get(observation, ['properties', accessors.survey])
    const survey = surveyId ? surveys.find(survey => survey.name === surveyId) : null
    return (
      <aside role='complementary' className='sidebar--observations'>
        <div className='meta__group'>
          <h2 className='data__subtitle'>Basic Information</h2>
          <ul className='meta__prose'>
            {tableHeaders.map(t => <li key={t[1]}>{t[0]}: <strong>{get(observation.properties, t[1], nullValue)}</strong></li>)}
          </ul>
        </div>
        <div className='meta__group'>

          <h2 className='data__subtitle'>Tags</h2>
          {tags.length ? (
            <ul className='meta__prose'>
              {tags.map(t => this.renderSurveyTag(t, survey))}
            </ul>
            ) : <p>--</p>}
        </div>
      </aside>
    )
  }
}

Metadata.proptypes = {
  observation: PropTypes.object,
  surveys: PropTypes.instanceOf(List)
}

module.exports = connect(state => ({
  surveys: getSurveys(state)
}))(Metadata)
