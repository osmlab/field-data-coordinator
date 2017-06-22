'use strict'
const React = require('react')
const Button = require('material-ui/RaisedButton').default
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
    const showFullWidth = true
    return (
      <div className='export'>
        <Button
          style={{marginBottom: '10px'}}
          fullWidth={showFullWidth}
          primary={showFullWidth}
          label='Export'
          onTouchTap={this.exportActive} />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeIds: state.observations.get('active'),
  activeFeatures: getActiveFeatures(state.observations)
})
module.exports = connect(mapStateToProps)(Export)
