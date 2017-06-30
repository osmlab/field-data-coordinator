'use strict'
const React = require('react')
const Modal = require('../Modal.jsx')
const mapboxgl = require('mapbox-gl')
const bboxPolygon = require('@turf/bbox-polygon')
const calculateArea = require('@turf/area')
const PropTypes = require('prop-types')
const { getOsm } = require('../../actions')
const { connect } = require('react-redux')
const { querySavedOsm } = require('../../drivers/local')

const INITIAL_ZOOM = 11
const INITIAL_CENTER = [-73.985428, 40.748817]

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
    this.handleShortcuts = this.handleShortcuts.bind(this)
    document.addEventListener('keydown', this.handleShortcuts)

    this.persistContainerDimensions = this.persistContainerDimensions.bind(this)
    window.addEventListener('resize', this.persistContainerDimensions)

    this.init = this.init.bind(this)
    this.persistMapBounds = this.persistMapBounds.bind(this)
    this.queryBounds = this.queryBounds.bind(this)
    this.logData = this.logData.bind(this)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleShortcuts)
    window.removeEventListener('resize', this.persistContainerDimensions)
    if (this.map) {
      this.map.off('moveend', this.persistMapBounds)
      this.map.remove()
      this.map = null
    }
  }

  render () {
    const { loading, bounds } = this.props
    return (
      <div>
        <button onClick={() => this.setState({ active: true })}>Select a geographic area</button>
        { loading ? <p>Loading ...</p> : null }
        { bounds ? <p>Current bounds: {bounds.join(', ')}</p> : null }
        <button onClick={this.logData}>Log current data</button>

        {this.state.active ? (
          <Modal>
            <div className='selectionmap__parent'>
              <div className='selectionmap' ref={this.init} />
              <div className='selectionmap__selection' style={this.getStyle()} />
            </div>
            <button onClick={this.queryBounds}>Confirm</button>
            <button onClick={() => this.setState({ active: false })}>Cancel</button>
          </Modal>
        ) : null}
      </div>
    )
  }

  init (el) {
    if (!el) return
    const map = this.map = new mapboxgl.Map({
      container: el,
      style: 'mapbox://styles/mapbox/satellite-v9',
      zoom: INITIAL_ZOOM,
      center: INITIAL_CENTER
    })
    map.addControl(new mapboxgl.NavigationControl())
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    map.once('load', () => {
      map.on('moveend', this.persistMapBounds)
      this.persistMapBounds()
    })

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

  persistMapBounds () {
    const { _sw, _ne } = this.map.getBounds()
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

  queryBounds () {
    const { mapWidth, mapHeight } = this.state
    const { width: edge } = this.getDimensions()
    const north = (mapHeight - edge) / 2
    const west = (mapWidth - edge) / 2
    const south = north + edge
    const east = west + edge
    const sw = this.map.unproject([west, south])
    const ne = this.map.unproject([east, north])
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

const mapStateToProps = ({ osmBounds, loading }) => {
  return {
    loading,
    bounds: osmBounds.length ? osmBounds : null
  }
}

module.exports = connect(mapStateToProps, { getOsm })(SelectGeography)
