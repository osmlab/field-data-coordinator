'use strict'
const React = require('react')
const { connect } = require('react-redux')
const immutable = require('immutable')
const PropTypes = require('prop-types')
const { getFlattenedProperties } = require('../../selectors')
const DatePicker = require('react-datepicker').default
const moment = require('moment')
const { toggleFilterProperty, clearFilterProperties, setObservationTimeRange } = require('../../actions')

const excludedProperties = ['id', '_timestamp', '_device_id', '_preset_id']

class Properties extends React.Component {
  constructor (props) {
    super(props)
    this.toggleFilterProperty = this.toggleFilterProperty.bind(this)
    this.clearFilterProperties = this.clearFilterProperties.bind(this)
    this.togglePropertiesPane = this.togglePropertiesPane.bind(this)
    this.setStartDate = this.setStartDate.bind(this)
    this.setEndDate = this.setEndDate.bind(this)
    const timestamps = this.getSortedTimestamps()
    this.state = {
      startDate: timestamps[0],
      endDate: timestamps[timestamps.length - 1],
      showProperties: false
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
    if (!properties._timestamp) return []
    return Object.keys(properties._timestamp).map(t => parseInt(t, 10)).sort()
  }

  render () {
    const { properties } = this.props
    const { showProperties } = this.state
    const timestamps = this.getSortedTimestamps()
    return (
      <aside role='complementary' className='sidebar'>
        <h4>Filter</h4>
        <a className='filterClear' onClick={this.clearFilterProperties}>Clear All</a>
        {timestamps.length ? this.renderTimeRange(timestamps) : null}
        {['_device_id', '_preset_id'].map(name => {
          return this.renderProperty(name, properties[name])
        })}
        <h5 className='clickable' onClick={this.togglePropertiesPane}>All properties { showProperties ? '[hide]' : '[show]' }</h5>
        { showProperties ? Object.keys(properties).map(name => {
          if (excludedProperties.indexOf(name) >= 0) return null
          return this.renderProperty(name, properties[name])
        }) : null }
      </aside>
    )
  }

  renderProperty (name, responses) {
    let activeProperty = this.props.activeProperties.get(name)
    return (
      <fieldset className='property' key={name}>
        <legend htmlFor={`{name}-responses`}>{name}</legend>
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
      <div className='timeRanges'>
        Start: <DatePicker
          minDate={moment(timestamps[0])}
          maxDate={moment(timestamps[timestamps.length - 1])}
          selected={moment(startDate)}
          onChange={this.setStartDate}
          selectsStart
        />
        End: <DatePicker
          minDate={moment(timestamps[0])}
          maxDate={moment(timestamps[timestamps.length - 1])}
          selected={moment(endDate)}
          onChange={this.setEndDate}
          selectsEnd
        />
      </div>
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

  togglePropertiesPane () {
    this.setState({ showProperties: !this.state.showProperties })
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
