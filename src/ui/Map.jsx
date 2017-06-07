'use strict'
const React = require('react')
const mapboxgl = require('mapbox-gl')
const { connect } = require('react-redux')
const PropTypes = require('prop-types')
const immutable = require('immutable')
const extent = require('turf-extent')
const { getActiveFeatures } = require('../reducers/observations')

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZWd5cHQiLCJhIjoiY2l6ZTk5YTNxMjV3czMzdGU5ZXNhNzdraSJ9.HPI_4OulrnpD8qI57P12tg'
const SOURCE = 'ACTIVE_OBSERVATIONS'

const markerStyle = {
  id: 'observations',
  type: 'circle',
  source: SOURCE,
  paint: {
    'circle-radius': 6,
    'circle-color': '#B42222'
  },
  filter: ['==', '$type', 'Point']
}

class Map extends React.Component {
  constructor (props) {
    super(props)
    this.init = this.init.bind(this)
    this.mousemove = this.mousemove.bind(this)
  }

  componentWillReceiveProps ({ activeIds, activeFeatures }) {
    if (activeIds !== this.props.activeIds) {
      this.whenReady(() => {
        this.map.getSource(SOURCE).setData(activeFeatures)
        this.map.fitBounds(extent(activeFeatures))
      })
    }
  }

  componentWillUnmount () {
    this.map.off('mousemove', this.mousemove)
    this.map.remove()
    this.map = null
  }

  init (el) {
    if (!el) return
    const map = this.map = new mapboxgl.Map({
      container: el,
      style: 'mapbox://styles/mapbox/satellite-v9'
    })
    map.addControl(new mapboxgl.NavigationControl())
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
    this.whenReady(() => {
      const { activeFeatures } = this.props
      map.addSource(SOURCE, { type: 'geojson', data: activeFeatures })
      if (activeFeatures.features.length) {
        this.map.fitBounds(extent(activeFeatures))
      }
      map.addLayer(markerStyle)
      map.on('mousemove', this.mousemove)
    })
  }

  mousemove (e) {
    const features = this.map.queryRenderedFeatures(e.point, { layer: [SOURCE] })
    this.map.getCanvas().style.cursor = features.length ? 'pointer' : ''
  }

  whenReady (fn) {
    if (this.map.loaded()) fn()
    else this.map.once('load', () => fn.call(this))
  }

  render () {
    return (
      <div className='map' ref={this.init} />
    )
  }
}

Map.propTypes = {
  // immutable list for speedy comparisons
  activeIds: PropTypes.instanceOf(immutable.List),
  // just a regular geojson FeatureCollection
  activeFeatures: PropTypes.object
}

const mapStateToProps = state => ({
  activeIds: state.observations.get('active'),
  activeFeatures: getActiveFeatures(state.observations)
})
module.exports = connect(mapStateToProps)(Map)
