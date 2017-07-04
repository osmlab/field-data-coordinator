'use strict'
const React = require('react')
const { connect } = require('react-redux')
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

  componentWillMount () {
    this.clearFilterProperties()
  }

  render () {
    const { properties } = this.props
    return (
      <aside role='complementary' className='sidebar'>
        <h4>Filter</h4>
        <a className='filterClear' onClick={this.clearFilterProperties}>Clear All</a>
        {Object.keys(properties).map(name => {
          return this.renderProperty(name, properties[name])
        })}
      </aside>
    )
  }

  renderProperty (name, responses) {
    let activeProperty = this.props.activeProperties.get(name)
    return (
      <fieldset className='property' key={name}>
        <legend htmlFor={`{name}-responses`}>{name}</legend>
        <ul className='filters' id={`${name}-responses`}>
          {Object.keys(responses).map(response => (
            <li key={response} className='filterWrapper clearfix'>
              <input type='checkbox'
                className='checkbox'
                id={'checkbox--' + response}
                checked={activeProperty === response}
                onClick={() => this.toggleFilterProperty(name, response)} />
              <label htmlFor={'checkbox--' + response}>{`${response} (${responses[response]})`}</label>
            </li>
          ))}
        </ul>
      </fieldset>
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
