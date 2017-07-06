'use strict'
const React = require('react')
const Modal = require('../Modal.jsx')
const bboxPolygon = require('@turf/bbox-polygon')
const calculateArea = require('@turf/area')
const centroid = require('@turf/centroid')
const PropTypes = require('prop-types')
const Map = require('../map')
const objectPath = require('object-path')
const { getOsm } = require('../../actions')
const { connect } = require('react-redux')
const { querySavedOsm } = require('../../drivers/local')

const INITIAL_ZOOM = 11
const INITIAL_CENTER = [-73.985428, 40.748817]

// 27 square kilometers
const MAX_AREA = 27 * 27 * 1000

const selectedMapOptions = {
  interactive: false
}

class SelectGeography extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      active: false,

      // container dimensions
      mapWidth: 0,
      mapHeight: 0,

      mapBounds: []
    }
  }

  componentWillMount () {
    this.handleShortcuts = this.handleShortcuts.bind(this)
    document.addEventListener('keydown', this.handleShortcuts)

    this.persistContainerElement = this.persistContainerElement.bind(this)
    this.persistContainerDimensions = this.persistContainerDimensions.bind(this)
    window.addEventListener('resize', this.persistContainerDimensions)

    this.onMapLoad = this.onMapLoad.bind(this)
    this.logData = this.logData.bind(this)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleShortcuts)
    window.removeEventListener('resize', this.persistContainerDimensions)
  }

  render () {
    const { loading, bounds, error } = this.props
    const center = !bounds ? INITIAL_CENTER
    : objectPath.get(centroid(bboxPolygon(bounds)), 'geometry.coordinates', INITIAL_CENTER)

    return (
      <div>
        { loading ? <p>Loading ...</p> : null }
        { error ? <p>{error}</p> : null}
        { bounds && !loading && !error ? this.renderCurrentSelection(center) : null }
        { !bounds && !loading ? <p>No area selected</p> : null }
        <button onClick={() => this.setState({ active: true })}>Select a geographic area</button>
        <button onClick={this.logData}>Log current data</button>

        {this.state.active ? (
          <Modal>
            <div className='selectionmap__parent' ref={this.persistContainerElement}>
              <Map
                zoom={INITIAL_ZOOM}
                center={center}
                onLoad={this.onMapLoad}
                onUnmount={this.onMapUnmount}
                containerClass={'selectionmap'}
              />
              <div className='selectionmap__selection' style={this.getStyle()} />
            </div>
            <button className='button' onClick={this.queryBounds}>Confirm</button>
            <button onClick={() => this.setState({ active: false })}>Cancel</button>
          </Modal>
        ) : null}
      </div>
    )
  }

  renderCurrentSelection (center) {
    const { bounds } = this.props
    return (
      <div className='selected'>
        <p>Current Selection</p>
        <Map
          options={selectedMapOptions}
          containerClass='selected__map'
          zoom={INITIAL_ZOOM}
          center={center}
          onInit={(map) => map.fitBounds(bounds)}
        />
        <p>Coordinates: {bounds.map(b => b.toFixed(5)).join(', ')}</p>
        <p>Area: {(calculateArea(bboxPolygon(bounds)) / 1000).toFixed(2)} km<sup>2</sup></p>
      </div>
    )
  }

  onMapLoad (map) {
    this.queryBounds = this.queryBounds.bind(this, map)
    this.persistMapBounds = this.persistMapBounds.bind(this, map)
    map.on('moveend', this.persistMapBounds)
    this.persistMapBounds()
  }

  onMapUnmount (map) {
    map.off('moveend', this.persistMapBounds)
  }

  persistContainerElement (el) {
    if (!el) return
    // Store a reference to the parent element in order
    // to read the container dimensions on page resize.
    this.container = el
    // Set the initial width & height state
    this.persistContainerDimensions()
  }

  persistContainerDimensions () {
    const dim = this.container.getBoundingClientRect()
    this.setState({ mapWidth: dim.width, mapHeight: dim.height })
  }

  persistMapBounds (map) {
    const { _sw, _ne } = map.getBounds()
    this.setState({ mapBounds: [ _sw.lng, _sw.lat, _ne.lng, _ne.lat ] })
  }

  getDimensions () {
    const { mapWidth, mapHeight, mapBounds } = this.state
    // calculate viewport area in square meters
    const viewportArea = calculateArea(bboxPolygon(mapBounds))
    // calculate the length of the edge, given a constant maximum area
    const viewportEdge = Math.min(mapWidth, mapHeight)
    const ratio = viewportArea < MAX_AREA ? 1
      : Math.sqrt(MAX_AREA) / Math.sqrt(viewportArea)
    const edge = viewportEdge * ratio
    return { width: edge, height: edge }
  }

  getStyle () {
    const { width, height } = this.getDimensions()
    return { width: width + 'px', height: height + 'px' }
  }

  queryBounds (map) {
    const { mapWidth, mapHeight } = this.state
    const { width: edge } = this.getDimensions()
    const north = (mapHeight - edge) / 2
    const west = (mapWidth - edge) / 2
    const south = north + edge
    const east = west + edge
    const sw = map.unproject([west, south])
    const ne = map.unproject([east, north])
    this.props.getOsm([sw.lng, sw.lat, ne.lng, ne.lat])
    this.setState({ active: false })
  }

  handleShortcuts ({ keyCode }) {
    switch (keyCode) {
      case (27): // esc
        return this.setState({ active: false })
    }
  }

  logData () {
    const { bounds } = this.props
    if (!bounds) console.log('No data in local osm p2p store')
    else querySavedOsm([[bounds[1], bounds[3]], [bounds[0], bounds[2]]], console.log)
  }
}

SelectGeography.propTypes = {
  loading: PropTypes.bool,
  bounds: PropTypes.array
}

const mapStateToProps = ({ osmBounds, loading, errors }) => {
  return {
    loading,
    bounds: osmBounds.length ? osmBounds : null,
    error: errors.get('osmQuery')
  }
}

module.exports = connect(mapStateToProps, { getOsm })(SelectGeography)
