'use strict'
const React = require('react')
const mapboxgl = require('mapbox-gl')
const { connect } = require('react-redux')
const PropTypes = require('prop-types')
const immutable = require('immutable')
const extent = require('turf-extent')
const { withRouter } = require('react-router-dom')
const { setActiveObservation } = require('../../actions')
const { getActiveFeatures } = require('../../reducers/observations')

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

function tooltip (feature) {
  return `
  <p>${JSON.stringify(feature.properties)}</p>
  <p data-href='${feature.properties.id}' data-observation=1>Link</p>
  `
}

class Map extends React.Component {
  constructor (props) {
    super(props)
    this.init = this.init.bind(this)
    this.mousemove = this.mousemove.bind(this)
    this.mouseclick = this.mouseclick.bind(this)
    this.navigate = this.navigate.bind(this)
  }

  componentWillReceiveProps ({ activeIds, activeFeatures }) {
    if (activeIds !== this.props.activeIds) {
      this.map.getSource(SOURCE).setData(activeFeatures)
      this.fit(activeFeatures)
    }
  }

  componentWillUnmount () {
    this.map.off('mousemove', this.mousemove)
    this.map.off('click', this.mouseclick)
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
    map.once('load', () => {
      const { activeFeatures } = this.props
      map.addSource(SOURCE, { type: 'geojson', data: activeFeatures })
      this.fit(activeFeatures)
      map.addLayer(markerStyle)
      map.on('mousemove', this.mousemove)
      map.on('click', this.mouseclick)
    })
  }

  mousemove (e) {
    const features = this.map.queryRenderedFeatures(e.point, { layer: [SOURCE] })
    this.map.getCanvas().style.cursor = features.length ? 'pointer' : ''
  }

  mouseclick (e) {
    const features = this.map.queryRenderedFeatures(e.point, { layer: [SOURCE] })
    if (features.length) this.open(e.lngLat, features[0])
  }

  open (lngLat, feature) {
    if (this.popup) this.popup.remove()
    this.popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: true
    })
    .setLngLat(lngLat)
    .setHTML(tooltip(feature))
    .addTo(this.map)
  }

  close () {
    this.popup.remove()
  }

  navigate ({ target }) {
    // true if it's an observation link
    if (typeof target.getAttribute === 'function' && target.getAttribute('data-observation')) {
      const observationId = target.getAttribute('data-href')
      const { history, match } = this.props
      // persist the active observation to state, in addition to changing the route
      this.props.dispatch(setActiveObservation(observationId))
      history.push(`${match.url}/observations/${observationId}`)
    }
  }

  fit (activeFeatures) {
    const { features } = activeFeatures
    if (features && features.length) {
      if (features.length === 1) {
        this.map.setCenter(features[0].geometry.coordinates)
        this.open(features[0].geometry.coordinates, features[0])
      } else {
        this.map.fitBounds(extent(activeFeatures), { padding: 20 })
        if (this.popup) this.close()
      }
    } else if (this.popup) this.close()
  }

  render () {
    return (
      <div className='map' ref={this.init} onClick={this.navigate} />
    )
  }
}

Map.propTypes = {
  // immutable list for speedy comparisons
  activeIds: PropTypes.instanceOf(immutable.List),
  // just a regular geojson FeatureCollection
  activeFeatures: PropTypes.object,
  observationId: PropTypes.string
}

const mapStateToProps = state => {
  return {
    activeIds: state.observations.get('active'),
    activeFeatures: getActiveFeatures(state.observations)
  }
}
module.exports = withRouter(connect(mapStateToProps)(Map))
