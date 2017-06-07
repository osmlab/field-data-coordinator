'use strict'
const React = require('react')
const { connect } = require('react-redux')
const Checkbox = require('material-ui/Checkbox').default

class Sidebar extends React.Component {
  render () {
    return (
      <aside role='complementary' className='sidebar'>
        <h2>Survey Attributes</h2>
        <Checkbox label='something' />
      </aside>
    )
  }
}

const mapStateToProps = state => (state)
module.exports = connect(mapStateToProps)(Sidebar)
