'use strict'
const React = require('react')
const { connect } = require('react-redux')
const Checkbox = require('material-ui/Checkbox').default
const immutable = require('immutable')
const PropTypes = require('prop-types')
const { getPropertiesList } = require('../../reducers/observations')
const { toggleFilterProperty } = require('../../actions')

class Sidebar extends React.Component {
  render () {
    const { properties, dispatch } = this.props
    const checkboxes = []
    for (let property in properties) {
      checkboxes.push({ property, count: properties[property] })
    }
    return (
      <aside role='complementary' className='sidebar'>
        <h2>Survey Attributes</h2>
        {checkboxes.map(d => <Checkbox
          key={d.property}
          label={`${d.property} (${d.count})`}
          onClick={() => dispatch(toggleFilterProperty(d.property))}
        />)}
      </aside>
    )
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
    properties: getPropertiesList(state.observations)
  }
}
module.exports = connect(mapStateToProps)(Sidebar)
