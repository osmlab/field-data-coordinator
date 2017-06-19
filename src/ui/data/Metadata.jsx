'use strict'
const React = require('react')
const { connect } = require('react-redux')
const { getActiveFeatures } = require('../../reducers/observations')

class Metadata extends React.Component {
  render () {
    return (
      <aside role='complementary' className='sidebar sidebar__metadata'>
        <h2>Basic Information</h2>
        <p>Name of point</p>
        <p>TODO</p>
      </aside>
    )
  }
}

const mapStateToProps = state => ({
  activeFeatures: getActiveFeatures(state.observations)
})

module.exports = connect(mapStateToProps)(Metadata)
