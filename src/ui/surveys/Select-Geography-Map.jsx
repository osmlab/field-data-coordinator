'use strict'
const React = require('react')
const mapboxgl = require('mapbox-gl')

const INITIAL_ZOOM = 11
const INITIAL_CENTER = [-73.985428, 40.748817]

class SelectionMap extends React.Component {
  constructor (props) {
    super(props)
    this.state = { width: 0, height: 0, zoom: INITIAL_ZOOM }
  }

  componentWillMount () {
    this.init = this.init.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
    window.addEventListener('resize', this.onWindowResize)
  }

  componentWillUnmount () {
    this.map.remove()
    this.map = null
    window.removeEventListener('resize', this.onWindowResize)
  }

  render () {
    return (
      <div className='selectionmap' ref={this.init} />
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

    // Store a reference to the parent element in order
    // to read the container dimensions on page resize.
    this.container = el
    // Set the initial width & height state
    this.onWindowResize()
  }

  onWindowResize () {
    const dim = this.container.getBoundingClientRect()
    this.setState({ width: dim.width, height: dim.height })
  }
}

module.exports = SelectionMap
