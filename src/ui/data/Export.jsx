'use strict'
const React = require('react')
const { connect } = require('react-redux')

class Export extends React.Component {
  constructor (props) {
    super(props)
    this.exportActive = this.exportActive.bind(this)
  }

  exportActive () {
    const { activeIds } = this.props
    console.log(activeIds.toJS())
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
  activeIds: state.observations.get('active')
})
module.exports = connect(mapStateToProps)(Export)
