'use strict'
const React = require('react')
const { connect } = require('react-redux')
const Checkbox = require('material-ui/Checkbox').default
const immutable = require('immutable')
const PropTypes = require('prop-types')
const { getFlattenedProperties } = require('../../reducers/observations')
const { toggleFilterProperty } = require('../../actions')

class Sidebar extends React.Component {
  constructor (props) {
    super(props)
    this.toggleFilterProperty = this.toggleFilterProperty.bind(this)
  }

  render () {
    const { properties } = this.props
    return (
      <aside role='complementary' className='sidebar'>
        <h2>Survey Attributes</h2>
        {Object.keys(properties).map(name => {
          if (name === 'id') return null
          return this.renderProperty(name, properties[name])
        })}
      </aside>
    )
  }

  renderProperty (name, responses) {
    return (
      <div className='property' key={name}>
        <label htmlFor={`{name}-responses`}>{name}</label>
        <ul id={`${name}-responses`}>
          {Object.keys(responses).map(response => (
            <li key={response}>
              <Checkbox
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

Sidebar.propTypes = {
  // immutable list of all observation ids
  observations: PropTypes.instanceOf(immutable.List),
  // object containing feature property names and their count
  properties: PropTypes.object,
  dispatch: PropTypes.func
}

const mapStateToProps = state => {
  return {
    observations: state.observations.get('all'),
    properties: getFlattenedProperties(state.observations)
  }
}
module.exports = connect(mapStateToProps)(Sidebar)
