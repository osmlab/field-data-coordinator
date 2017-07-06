'use strict'
const React = require('react')
const { connect } = require('react-redux')

class Export extends React.Component {
  constructor (props) {
    super(props)
    this.exportXml = this.exportXml.bind(this)
    this.exportJson = this.exportJson.bind(this)
    this.exportGeojson = this.exportGeojson.bind(this)
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

  exportXml () {
  }

  exportJson () {
  }

  exportGeojson () {
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
              <li className='dropdownOption' onClick={this.exportXml}>XML</li>
              <li className='dropdownOption' onClick={this.exportJson}>JSON</li>
              <li className='dropdownOption' onClick={this.exportGeojson}>GeoJSON</li>
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
