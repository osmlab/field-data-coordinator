'use strict'
const React = require('react')
const { connect } = require('react-redux')
const immutable = require('immutable')
const PropTypes = require('prop-types')
const { getFlattenedProperties } = require('../../selectors')
const DatePicker = require('react-datepicker').default
const moment = require('moment')
const { toggleFilterProperty, clearFilterProperties, setObservationTimeRange } = require('../../actions')
const { accessors, filterItems } = require('./property-names')
const { timestamp } = accessors

class Properties extends React.Component {
  constructor (props) {
    super(props)
    this.toggleFilterProperty = this.toggleFilterProperty.bind(this)
    this.clearFilterProperties = this.clearFilterProperties.bind(this)
    this.setStartDate = this.setStartDate.bind(this)
    this.setEndDate = this.setEndDate.bind(this)
    const timestamps = this.getSortedTimestamps()
    this.state = {
      startDate: timestamps[0],
      endDate: timestamps[timestamps.length - 1]
    }
  }

  clearFilterProperties () {
    this.props.clearFilterProperties()
  }

  componentWillMount () {
    this.clearFilterProperties()
  }

  componentWillReceiveProps ({ dateRange }) {
    if (dateRange !== this.props.dateRange) {
      if (!dateRange.size) {
        const timestamps = this.getSortedTimestamps()
        this.setState({
          startDate: timestamps[0],
          endDate: timestamps[timestamps.length - 1]
        })
      } else {
        this.setState({
          startDate: dateRange.first(),
          endDate: dateRange.last()
        })
      }
    }
  }

  getSortedTimestamps () {
    const { properties } = this.props
    if (!properties[timestamp]) return []
    return Object.keys(properties[timestamp]).map(t => new Date(t)).sort()
  }

  render () {
    const { properties } = this.props
    const timestamps = this.getSortedTimestamps()
    return (
      <aside role='complementary' className='sidebar'>
        <h3>Filter</h3>
        <a className='filterClear clickable' onClick={this.clearFilterProperties}>Clear All</a>
        {timestamps.length ? this.renderTimeRange(timestamps) : null}
        {filterItems.map(item => {
          return properties[item[1]] ? this.renderProperty(item[0], item[1], properties[item[1]]) : null
        })}
      </aside>
    )
  }

  renderProperty (displayName, name, responses) {
    let activeProperty = this.props.activeProperties.get(name)
    return (
      <fieldset className='property' key={name}>
        <legend htmlFor={`{name}-responses`}>{displayName}</legend>
        <ul className='filters' id={`${name}-responses`}>
          {Object.keys(responses).map(response => (
            <li key={response} className='filterWrapper clearfix'>
              <input type='checkbox'
                className='checkbox'
                id={'checkbox--' + response}
                checked={activeProperty === response}
                onClick={() => this.toggleFilterProperty(name, response)} />
              <label htmlFor={'checkbox--' + response}>{`${response} (${responses[response]})`}</label>
            </li>
          ))}
        </ul>
      </fieldset>
    )
  }

  renderTimeRange (timestamps) {
    const { startDate, endDate } = this.state
    return (
      <fieldset className='timeRanges'>
        <legend>Date Range</legend>
        <ul>
          <li>
            <label className='label-interior'>Start:</label>
            <DatePicker
              minDate={moment(timestamps[0])}
              maxDate={moment(timestamps[timestamps.length - 1])}
              selected={moment(startDate)}
              onChange={this.setStartDate}
              selectsStart
            />
          </li>
          <li>
            <label className='label-interior'>End:</label>
            <DatePicker
              minDate={moment(timestamps[0])}
              maxDate={moment(timestamps[timestamps.length - 1])}
              selected={moment(endDate)}
              onChange={this.setEndDate}
              selectsEnd
            />
          </li>
        </ul>
      </fieldset>
    )
  }

  setStartDate (start) {
    let startDate = start.valueOf()
    this.props.setObservationTimeRange([startDate, this.state.endDate])
  }

  setEndDate (end) {
    let endDate = end.valueOf()
    this.props.setObservationTimeRange([this.state.startDate, endDate])
  }

  toggleFilterProperty (name, response) {
    this.props.toggleFilterProperty({ k: name, v: response })
  }
}

Properties.propTypes = {
  // immutable list of all observation ids
  observations: PropTypes.instanceOf(immutable.List),
  // object containing feature property names and their count
  properties: PropTypes.object,
  // currently active properties
  activeProperties: PropTypes.instanceOf(immutable.Map)
}

const mapStateToProps = state => {
  return {
    observations: state.observations.get('all'),
    properties: getFlattenedProperties(state),
    dateRange: state.observations.get('dateRange'),
    activeProperties: state.observations.get('filterProperties')
  }
}

module.exports = connect(mapStateToProps, {
  toggleFilterProperty,
  clearFilterProperties,
  setObservationTimeRange
})(Properties)
