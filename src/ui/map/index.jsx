'use strict'
const React = require('react')
const mapboxgl = require('mapbox-gl')
const PropTypes = require('prop-types')

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
    const { zoom, center } = this.props
    const map = this.map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/satellite-v9',
      container,
      zoom,
      center
    })

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
  containerClass: PropTypes.string,
  zoom: PropTypes.number,
  center: PropTypes.array,
  onInit: PropTypes.func,
  onLoad: PropTypes.func,
  onUnmount: PropTypes.func
}

module.exports = Map
