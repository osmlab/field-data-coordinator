'use strict'
const React = require('react')
const mapboxgl = require('mapbox-gl')
const PropTypes = require('prop-types')

const INITIAL_ZOOM = 11
const INITIAL_CENTER = [-73.985428, 40.748817]

class Map extends React.Component {
  componentWillMount () {
    this.init = this.init.bind(this)
  }

  componentWillUnmount () {
    if (typeof this.props.onUnmount === 'function') {
      this.props.onUnmount(this.map)
    }
    this.map.remove()
    this.map = null
  }

  init (container) {
    if (!container) return
    const { zoom, center, options } = this.props
    let opts = {
      style: 'mapbox://styles/mapbox/satellite-v9',
      zoom: zoom || INITIAL_ZOOM,
      center: center || INITIAL_CENTER,
      container
    }
    if (options) opts = Object.assign(opts, options)
    const map = this.map = new mapboxgl.Map(opts)

    map.addControl(new mapboxgl.NavigationControl())
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    if (typeof this.props.onInit === 'function') {
      this.props.onInit(map)
    }

    if (typeof this.props.onLoad === 'function') {
      map.once('load', () => this.props.onLoad(map))
    }
  }

  render () {
    const { containerClass } = this.props
    return (
      <div className={containerClass} ref={this.init} />
    )
  }
}

Map.propTypes = {
  options: PropTypes.object,
  containerClass: PropTypes.string,
  zoom: PropTypes.number,
  center: PropTypes.array,
  onInit: PropTypes.func,
  onLoad: PropTypes.func,
  onUnmount: PropTypes.func
}

module.exports = Map
