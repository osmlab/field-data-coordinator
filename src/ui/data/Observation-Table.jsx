'use strict'
const React = require('react')
const Paginator = require('paginator')
const get = require('object-path').get
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
    this.setSortProperty = this.setSortProperty.bind(this)
    this.getColumnNames = this.getColumnNames.bind(this)
    const columnNames = this.getColumnNames()
    this.state = {
      page: 1,
      sortProperty: columnNames[0],
      sortOrder: 1,
      columnNames
    }
  }

  componentWillReceiveProps ({ activeFeatureIds }) {
    // On new active feature list
    if (this.props.activeFeatureIds !== activeFeatureIds) {
      this.setState({ page: 1, columnNames: this.getColumnNames() })
    }
  }

  getColumnNames () {
    // Create the world of properties to use as column headers
    const features = get(this.props, 'activeFeatures.features', [])
    const properties = {}
    features.forEach(feature => {
      for (let property in feature.properties) {
        properties[property] = true
      }
    })
    return Object.keys(properties)
  }

  setSortProperty (prop) {
    const { sortProperty, sortOrder } = this.state
    if (prop === sortProperty) this.setState({ sortOrder: sortOrder * -1 })
    else this.setState({ sortProperty: prop, sortOrder: 1 })
  }

  renderPagination () {
    const currentPage = this.state.page
    const count = get(this.props, 'activeFeatures.features', []).length
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

  render () {
    const { page, sortOrder, sortProperty, columnNames } = this.state
    const features = get(this.props, 'activeFeatures.features', [])

    // Determine if we need to paginate
    const showPagination = features.length > limit
    const { start, stop } = showPagination ? getPaginatedStops(features, page)
      : { start: 0, stop: features.length }

    // Determine the sort order
    const prop = sortProperty || columnNames[0]
    const sortFunction = (a, b) => a.properties[prop] > b.properties[prop] ? -1 : 1

    // Get the sorted, paginated features
    const sortedRows = features.sort(sortFunction)
    if (sortOrder < 0) sortedRows.reverse()
    const visibleRows = sortedRows.slice(start, stop)

    return (
      <div className='tableScrollContainer'>
        { showPagination ? this.renderPagination() : null }
        <p>Showing {start + 1} - {stop}</p>
        <table className='table'>
          <thead>
            <tr>
              {columnNames.map(n => (
                <th key={n}
                  onClick={() => this.setSortProperty(n)}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(feature => (
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
