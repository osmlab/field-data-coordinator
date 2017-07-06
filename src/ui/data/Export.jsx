'use strict'
const React = require('react')
const { connect } = require('react-redux')
const { getActiveFeatures } = require('../../reducers/observations')

class Export extends React.Component {
  constructor (props) {
    super(props)
    this.exportActive = this.exportActive.bind(this)
  }

  exportActive () {
    const { activeIds, activeFeatures } = this.props
    console.log(activeIds.toJS())
    console.log(activeFeatures)
  }

  render () {
    return (
      <div className='export'>
        <button
          className='button'
          onClick={this.exportActive}>Export Selected Data</button>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeIds: state.observations.get('active'),
  activeFeatures: getActiveFeatures(state.observations)
})
module.exports = connect(mapStateToProps)(Export)
