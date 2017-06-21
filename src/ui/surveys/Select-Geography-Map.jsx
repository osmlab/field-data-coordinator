'use strict'
const React = require('react')
const mapboxgl = require('mapbox-gl')
const bboxPolygon = require('@turf/bbox-polygon')
const calculateArea = require('@turf/area')

const INITIAL_ZOOM = 11
const INITIAL_CENTER = [-73.985428, 40.748817]

// 50 square kilometers
const MAX_AREA = 50e7

class SelectionMap extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      // container dimensions
      width: 0,
      height: 0,

      // map bounds
      bounds: []
    }
  }

  componentWillMount () {
    this.init = this.init.bind(this)
    this.persistMapBounds = this.persistMapBounds.bind(this)
    this.persistContainerDimensions = this.persistContainerDimensions.bind(this)
    window.addEventListener('resize', this.persistContainerDimensions)
  }

  componentWillUnmount () {
    this.map.off('moveend', this.persistMapBounds)
    this.map.remove()
    this.map = null
    window.removeEventListener('resize', this.persistContainerDimensions)
  }

  render () {
    return (
      <div className='selectionmap__parent'>
        <div className='selectionmap' ref={this.init} />
        <div className='selectionmap__selection' style={this.getDimensions()} />
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
    this.setState({ width: dim.width, height: dim.height })
  }

  persistMapBounds () {
    const { _sw, _ne } = this.map.getBounds()
    this.setState({ bounds: [ _sw.lng, _sw.lat, _ne.lng, _ne.lat ] })
  }

  getDimensions () {
    const { width: mapWidth, height: mapHeight, bounds } = this.state
    // calculate viewport area in square meters
    const viewportArea = calculateArea(bboxPolygon(bounds))
    // calculate the length of the edge, given a constant maximum area
    const viewportEdge = Math.min(mapWidth, mapHeight)
    const ratio = viewportArea < MAX_AREA ? 1
      : Math.sqrt(MAX_AREA) / Math.sqrt(viewportArea)
    const edge = viewportEdge * ratio
    return {
      width: edge + 'px',
      height: edge + 'px'
    }
  }
}

module.exports = SelectionMap
