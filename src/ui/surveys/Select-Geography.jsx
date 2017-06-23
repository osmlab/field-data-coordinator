'use strict'
const React = require('react')
const RaisedButton = require('material-ui/RaisedButton').default
const Modal = require('../Modal.jsx')
const mapboxgl = require('mapbox-gl')
const bboxPolygon = require('@turf/bbox-polygon')
const calculateArea = require('@turf/area')
const { getOSM } = require('../../actions')
const { connect } = require('react-redux')

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

      // map bounds
      bounds: []
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
    return (
      <div>
        <RaisedButton
          label='Select a geographic area'
          onTouchTap={() => this.setState({ active: true })}
        />

        {this.state.active ? (
          <Modal>
            <div className='selectionmap__parent'>
              <div className='selectionmap' ref={this.init} />
              <div className='selectionmap__selection' style={this.getStyle()} />
            </div>
            <RaisedButton primary label='Confirm'
              onTouchTap={this.queryBounds}
            />
            <RaisedButton secondary label='Cancel'
              onTouchTap={() => this.setState({ active: false })}
            />
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
    this.setState({ bounds: [ _sw.lng, _sw.lat, _ne.lng, _ne.lat ] })
  }

  getDimensions () {
    const { mapWidth, mapHeight, bounds } = this.state
    // calculate viewport area in square meters
    const viewportArea = calculateArea(bboxPolygon(bounds))
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
    this.props.dispatch(getOSM([sw.lng, sw.lat, ne.lng, ne.lat]))
  }

  handleShortcuts ({ keyCode }) {
    switch (keyCode) {
      case (27): // esc
        return this.setState({ active: false })
    }
  }
}

module.exports = connect()(SelectGeography)
