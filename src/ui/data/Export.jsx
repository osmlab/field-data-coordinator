'use strict'
const React = require('react')
const { connect } = require('react-redux')
const {
  exportXml,
  exportJson,
  exportGeojson,
  exportCsv
} = require('../../drivers/local')

class Export extends React.Component {
  constructor (props) {
    super(props)
    this.getActive = this.getActive.bind(this)
    this.toggleOptions = this.toggleOptions.bind(this)
    this.state = {
      showOptions: false
    }
  }

  toggleOptions () {
    const { showOptions } = this.state
    if (!showOptions) {
      // delay the listener to avoid wiping the initial click
      window.setTimeout(() => {
        window.addEventListener('click', this.toggleOptions)
      }, 0)
    } else {
      window.removeEventListener('click', this.toggleOptions)
    }
    this.setState({ showOptions: !showOptions })
  }

  getActive () {
    return this.props.activeIds.toJS()
  }

  render () {
    return (
      <div className='export'>
        <div className='dropdown'>
          <button
            className='button'
            onClick={this.toggleOptions}>Export Selected Data</button>
          { this.state.showOptions ? (
            <ul className='dropdownOptions'>
              <li className='dropdownOption' onClick={() => exportXml(this.getActive())}>XML</li>
              <li className='dropdownOption' onClick={() => exportJson(this.getActive())}>JSON</li>
              <li className='dropdownOption' onClick={() => exportGeojson(this.getActive())}>GeoJSON</li>
              <li className='dropdownOption' onClick={() => exportCsv(this.getActive())}>CSV</li>
            </ul>
          ) : null }
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeIds: state.observations.get('active')
})
module.exports = connect(mapStateToProps)(Export)
