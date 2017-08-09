'use strict'
const React = require('react')
const Paginator = require('paginator')
const { getActiveFeatures } = require('../../selectors')
const { connect } = require('react-redux')
const nullvalue = '--'

// rows of table data per page
const limit = 10
const noop = e => e.preventDefault()

const getPaginatedStops = (features, page) => {
  const start = (page - 1) * limit
  const stop = start + limit > features.length ? features.length : start + limit
  return {start, stop}
}

class ObservationTable extends React.Component {
  constructor (props) {
    super(props)
    this.renderPagination = this.renderPagination.bind(this)
    this.state = {
      page: 1
    }
  }

  renderPagination () {
    const currentPage = this.state.page
    const count = this.props.activeFeatures.features.length
    const paginator = new Paginator(limit, 7)
    const meta = paginator.build(count, currentPage)
    const pages = []
    for (let i = meta.first_page; i <= meta.last_page; ++i) { pages.push(i) }
    return (
      <div className='pagination'>
        <ol>
          <li className={meta.has_previous_page ? '' : 'disabled'}
            onClick={meta.has_previous_page ? () => this.setState({page: currentPage - 1}) : noop}>Previous</li>
          {pages.map(page => (
            <li key={`pagination-page-${page}`}
              onClick={() => this.setState({ page })}
              className={page === currentPage ? 'active' : ''}>{page}</li>
          ))}
          <li className={meta.has_next_page ? '' : 'disabled'}
            onClick={meta.has_next_page ? () => this.setState({page: currentPage + 1}) : noop}>Next</li>
        </ol>
      </div>
    )
  }

  componentWillReceiveProps ({ activeFeatureIds }) {
    // new active feature list
    if (this.props.activeFeatureIds !== activeFeatureIds) {
      this.setState({ page: 1 })
    }
  }

  render () {
    const { activeFeatures } = this.props
    const features = activeFeatures.features
    const properties = {}
    features.forEach(feature => {
      for (let property in feature.properties) {
        properties[property] = true
      }
    })
    const columnNames = Object.keys(properties)
    const showPagination = features.length > limit
    const stops = showPagination ? getPaginatedStops(features, this.state.page)
      : { start: 0, stop: features.length }
    return (
      <div className='tableScrollContainer'>
        { showPagination ? this.renderPagination() : null }
        <p>Showing {stops.start + 1} - {stops.stop}</p>
        <table className='table'>
          <thead>
            <tr>
              {columnNames.map(n => <th key={n}>{n}</th>)}
            </tr>
          </thead>
          <tbody>
            {features.slice(stops.start, stops.stop).map(feature => (
              <tr key={feature.id}>
                {columnNames.map(n => (
                  <td key={feature.id + n}>{feature.properties[n] || nullvalue}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        { showPagination ? this.renderPagination() : null }
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    activeFeatures: getActiveFeatures(state),
    activeFeatureIds: state.observations.get('active')
  }
}
module.exports = connect(mapStateToProps)(ObservationTable)
