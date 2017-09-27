'use strict'
const React = require('react')
const c = require('classnames')
const Paginator = require('paginator')
const { withRouter } = require('react-router-dom')
const get = require('object-path').get
const { getActiveFeatures } = require('../../selectors')
const { connect } = require('react-redux')
const { setActiveObservation } = require('../../actions')
const { nullValue } = require('../format')
const {
  tableHeaders,
  tableRows
} = require('./property-names')

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
    this.navigate = this.navigate.bind(this)
    this.state = {
      page: 1,
      sortProperty: tableHeaders[0],
      sortOrder: 1
    }
  }

  componentWillReceiveProps ({ activeFeatureIds }) {
    // On new active feature list
    if (this.props.activeFeatureIds !== activeFeatureIds) {
      this.setState({ page: 1 })
    }
  }

  setSortProperty (prop) {
    const { sortProperty, sortOrder } = this.state
    if (prop === sortProperty) this.setState({ sortOrder: sortOrder * -1 })
    else this.setState({ sortProperty: prop, sortOrder: 1 })
  }

  navigate (id) {
    this.props.setActiveObservation(id)
    const { history, match } = this.props
    history.push(`${match.url}/observations/${id}`)
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
          <li className={c({ 'disabled': !meta.has_previous_page })}
            onClick={meta.has_previous_page ? () => this.setState({page: currentPage - 1}) : noop}>Previous</li>
          {pages.map(page => (
            <li key={`pagination-page-${page}`}
              onClick={() => this.setState({ page })}
              className={c({ 'active': page === currentPage })}>{page}</li>
          ))}
          <li className={c({ 'disabled': !meta.has_next_page })}
            onClick={meta.has_next_page ? () => this.setState({page: currentPage + 1}) : noop}>Next</li>
        </ol>
      </div>
    )
  }

  render () {
    const { page, sortOrder, sortProperty } = this.state
    const features = get(this.props, 'activeFeatures.features', [])

    // Determine if we need to paginate
    const showPagination = features.length > limit
    const { start, stop } = showPagination ? getPaginatedStops(features, page)
      : { start: 0, stop: features.length }

    // Determine the sort order
    const sortFunction = (a, b) => a.properties[sortProperty] > b.properties[sortProperty] ? -1 : 1

    // Get the sorted, paginated features
    const sortedRows = features.sort(sortFunction)
    if (sortOrder > 0) sortedRows.reverse()
    const visibleRows = sortedRows.slice(start, stop)
    console.log(visibleRows)

    return (
      <div>
        <p className='table--num'>Showing {start + 1} - {stop}</p>
        <div className='tableScrollContainer'>
          <table className='table'>
            <thead>
              <tr>
                {tableHeaders.map(n => (
                  <th key={n}
                    className={c('tableToggle', {
                      'tableToggleDesc': n === sortProperty && sortOrder > 0,
                      'tableToggleAsc': n === sortProperty && sortOrder < 0
                    })}
                    onClick={() => this.setSortProperty(n)}>{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(feature => (
                <tr key={feature.id} className='tableClickableRow' onClick={() => this.navigate(feature.id)}>
                  {tableRows.map(n => {
                    const value = typeof n === 'string' ? get(feature.properties, n, nullValue) : n(feature.properties)
                    return <td key={feature.id + n}>{value}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
module.exports = withRouter(connect(mapStateToProps, { setActiveObservation })(ObservationTable))
