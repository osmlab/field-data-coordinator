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

// 27 square kilometers
const MAX_AREA = 27 * 27 * 1000

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
    this.persistContainerElement = this.persistContainerElement.bind(this)
    this.persistContainerDimensions = this.persistContainerDimensions.bind(this)
    this.onMapLoad = this.onMapLoad.bind(this)
    this.handleShortcuts = this.handleShortcuts.bind(this)
    document.addEventListener('keydown', this.handleShortcuts)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleShortcuts)
  }

  render () {
    const { bounds } = this.props
    const center = !bounds ? null
    : objectPath.get(centroid(bboxPolygon(bounds)), 'geometry.coordinates', null)

    return (
      <div className='surveyInput'>
        <h4>Import data from OSM</h4>
        <button className='button buttonGroup' onClick={() => this.setState({ active: true })}>Select an area to import</button>
        {this.state.active ? (
          <Modal>
            <div className='selectionmap__parent' ref={this.persistContainerElement}>
              <Map
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

  onMapLoad (map) {
    this.queryBounds = this.queryBounds.bind(this, map)
    this.persistMapBounds = this.persistMapBounds.bind(this, map)
    map.on('moveend', this.persistMapBounds)
    window.addEventListener('resize', this.persistContainerDimensions)
    this.persistMapBounds()
  }

  onMapUnmount (map) {
    map.off('moveend', this.persistMapBounds)
    window.removeEventListener('resize', this.persistContainerDimensions)
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
  bounds: PropTypes.array
}

const mapStateToProps = ({ osmBounds }) => {
  return {
    bounds: osmBounds.length ? osmBounds : null
  }
}

module.exports = connect(mapStateToProps, { getOsm })(SelectGeography)
