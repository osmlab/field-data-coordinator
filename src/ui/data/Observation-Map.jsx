'use strict'
const React = require('react')
const mapboxgl = require('mapbox-gl')
const get = require('object-path').get
const { connect } = require('react-redux')
const PropTypes = require('prop-types')
const immutable = require('immutable')
const extent = require('turf-extent')
const { withRouter } = require('react-router-dom')
const { setActiveObservation } = require('../../actions')
const { getActiveFeatures } = require('../../selectors')
const { styleUrl } = require('../../config')
const { date } = require('../format')
const { SOURCE, markerStyle, hoverMarkerStyle } = require('../map/config')
const CLICK_TO_ZOOM_LEVEL = 6

class ObservationMap extends React.Component {
  constructor (props) {
    super(props)
    this.init = this.init.bind(this)
    this.mousemove = this.mousemove.bind(this)
    this.mouseclick = this.mouseclick.bind(this)
    this.navigate = this.navigate.bind(this)
    const isSingleObservation = props.hasOwnProperty('observationId')
    this.state = {
      singleObservation: isSingleObservation,
      showingPopup: false
    }
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
      style: styleUrl,
      zoom: 1
    })
    map.addControl(new mapboxgl.NavigationControl())
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
    map.once('load', () => {
      const { activeFeatures } = this.props
      map.addSource(SOURCE, { type: 'geojson', data: activeFeatures })
      this.fit(activeFeatures)
      map.addLayer(markerStyle)
      map.addLayer(hoverMarkerStyle)
      map.on('mousemove', this.mousemove)
      map.on('click', this.mouseclick)
    })
  }

  mousemove (e) {
    const features = this.map.queryRenderedFeatures(e.point, { layer: [SOURCE] })
    const id = get(features, '0.properties.id')
    if (id) {
      this.map.getCanvas().style.cursor = 'pointer'
      this.map.setFilter(hoverMarkerStyle.id, ['==', 'id', id])
    } else {
      this.map.getCanvas().style.cursor = ''
      if (!this.state.showingPopup) {
        this.map.setFilter(hoverMarkerStyle.id, ['==', 'id', ''])
      }
    }
  }

  mouseclick (e) {
    const features = this.map.queryRenderedFeatures(e.point, { layer: [SOURCE] })
    const id = get(features, '0.properties.id')
    if (id) this.fit({features: [features[0]]})
  }

  open (lngLat, feature) {
    if (this.popup) this.popup.remove()
    this.popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: true
    })
    .setLngLat(lngLat)
    .setHTML(this.tooltip(feature))
    .addTo(this.map)
    this.setState({ showingPopup: true })
    this.popup.once('close', () => this.setState({ showingPopup: false }))
  }

  close () {
    this.popup.remove()
  }

  tooltip ({ geometry, properties }) {
    const { singleObservation } = this.state
    return `
    <div class='data__meta'>
      <h2 class='data__title'>${properties.id}</h2>
      <ul class='data__list'>
        <li class='data__item'>${geometry.coordinates.join(', ')}</li>
        <li class='data__item'>Type: Observation</li>
      </ul>
      <dl class='meta-card__list'>
        <dt class='meta-card__title'>Device ID:</dt>
        <dd class='meta-card__def'>${properties._device_id}</dd>
        <dt class='meta-card__title'>Date:</dt>
        <dd class='meta-card__def'>${date(properties._timestamp)}</dd>
      </dl>
      ${singleObservation ? '' : `
      <a data-href='${properties.id}'
      class='clickable link--primary link--primary--card'
      data-observation=1>View Observation</a>
      `}
    </div>
    `
  }

  navigate ({ target }) {
    // true if it's an observation link
    if (typeof target.getAttribute === 'function' && target.getAttribute('data-observation')) {
      const observationId = target.getAttribute('data-href')
      const { history, match } = this.props
      // persist the active observation to state, in addition to changing the route
      this.props.setActiveObservation(observationId)
      history.push(`${match.url}/observations/${observationId}`)
    }
  }

  fit (activeFeatures) {
    const { features } = activeFeatures
    if (features && features.length) {
      if (features.length === 1) {
        this.map.setCenter(features[0].geometry.coordinates)
        const zoom = this.map.getZoom()
        if (zoom < CLICK_TO_ZOOM_LEVEL) {
          this.map.setZoom(CLICK_TO_ZOOM_LEVEL)
        }
        this.open(features[0].geometry.coordinates, features[0])
      } else {
        this.map.fitBounds(extent(activeFeatures), {
          padding: 20,
          maxZoom: 1
        })
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

ObservationMap.propTypes = {
  // immutable list for speedy comparisons
  activeIds: PropTypes.instanceOf(immutable.List),
  // just a regular geojson FeatureCollection
  activeFeatures: PropTypes.object,
  observationId: PropTypes.string
}

const mapStateToProps = state => {
  return {
    activeIds: state.observations.get('active'),
    activeFeatures: getActiveFeatures(state)
  }
}
module.exports = withRouter(connect(mapStateToProps, { setActiveObservation })(ObservationMap))
