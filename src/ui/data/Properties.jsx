'use strict'
const React = require('react')
const { connect } = require('react-redux')
const Checkbox = require('material-ui/Checkbox').default
const immutable = require('immutable')
const PropTypes = require('prop-types')
const { getFlattenedProperties } = require('../../reducers/observations')
const { toggleFilterProperty, clearFilterProperties } = require('../../actions')

class Properties extends React.Component {
  constructor (props) {
    super(props)
    this.toggleFilterProperty = this.toggleFilterProperty.bind(this)
    this.clearFilterProperties = this.clearFilterProperties.bind(this)
  }

  clearFilterProperties () {
    this.props.dispatch(clearFilterProperties())
  }

  render () {
    const { properties } = this.props
    return (
      <aside role='complementary' className='sidebar'>
        <h2>Survey Attributes</h2>
        <a onClick={this.clearFilterProperties}>Clear</a>
        {Object.keys(properties).map(name => {
          if (name === 'id') return null
          return this.renderProperty(name, properties[name])
        })}
      </aside>
    )
  }

  renderProperty (name, responses) {
    let activeProperty = this.props.activeProperties.get(name)
    return (
      <div className='property' key={name}>
        <label htmlFor={`{name}-responses`}>{name}</label>
        <ul id={`${name}-responses`}>
          {Object.keys(responses).map(response => (
            <li key={response}>
              <Checkbox
                checked={activeProperty === response}
                label={`${response} (${responses[response]})`}
                onClick={() => this.toggleFilterProperty(name, response)}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  toggleFilterProperty (name, response) {
    this.props.dispatch(toggleFilterProperty({ k: name, v: response }))
  }
}

Properties.propTypes = {
  // immutable list of all observation ids
  observations: PropTypes.instanceOf(immutable.List),
  // object containing feature property names and their count
  properties: PropTypes.object,
  // currently active properties
  activeProperties: PropTypes.instanceOf(immutable.Map),
  dispatch: PropTypes.func
}

const mapStateToProps = state => {
  return {
    observations: state.observations.get('all'),
    properties: getFlattenedProperties(state.observations),
    activeProperties: state.observations.get('filterProperties')
  }
}
module.exports = connect(mapStateToProps)(Properties)
