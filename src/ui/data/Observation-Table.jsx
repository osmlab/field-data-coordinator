'use strict'
const React = require('react')
const { getActiveFeatures } = require('../../selectors')
const { connect } = require('react-redux')
const nullvalue = '--'

class ObservationTable extends React.Component {
  render () {
    const { activeFeatures } = this.props
    const properties = {}
    activeFeatures.features.forEach(feature => {
      for (let property in feature.properties) {
        properties[property] = true
      }
    })
    const columnNames = Object.keys(properties)
    return (
      <div className='tableScrollContainer'>
        <table className='table'>
          <thead>
            <tr>
              {columnNames.map(n => <th key={n}>{n}</th>)}
            </tr>
          </thead>
          <tbody>
            {activeFeatures.features.map(feature => (
              <tr key={feature.id}>
                {columnNames.map(n => (
                  <td key={feature.id + n}>{feature.properties[n] || nullvalue}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    activeFeatures: getActiveFeatures(state)
  }
}
module.exports = connect(mapStateToProps)(ObservationTable)
