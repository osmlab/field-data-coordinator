'use strict'
const React = require('react')
const { connect } = require('react-redux')
const bboxPolygon = require('@turf/bbox-polygon')
const calculateArea = require('@turf/area')
const centroid = require('@turf/centroid')
const objectPath = require('object-path')
const Map = require('../map')
const { querySavedOsm } = require('../../drivers/local')

const selectedMapOptions = {
  interactive: false
}

class CurrentSelection extends React.Component {
  constructor (props) {
    super(props)
    this.onMapLoad = this.onMapLoad.bind(this)
  }

  render () {
    const { loading, bounds, error } = this.props
    const center = !bounds ? null
    : objectPath.get(centroid(bboxPolygon(bounds)), 'geometry.coordinates', null)
    return (
      <div>
        { loading ? <p>Loading ...</p> : null }
        { error ? <p>{error}</p> : null}
        { bounds && !loading && !error ? this.renderCurrentSelection(center) : null }
        { !bounds && !loading ? <p>No area selected</p> : null }
      </div>
    )
  }

  renderCurrentSelection (center) {
    const { bounds } = this.props
    return (
      <div className='selected'>
        <h4 className='subtitle'>Imported Geographic Area</h4>
        <Map
          options={selectedMapOptions}
          containerClass='selected__map'
          center={center}
          onInit={(map) => map.fitBounds(bounds)}
          onLoad={this.onMapLoad}
        />
        <div className='metadataWrapper'>
          <h4>Imported Geographic Area</h4>
          <p className='metadata'>Coordinates: {bounds.map(b => b.toFixed(5)).join(', ')}</p>
          <p className='metadata'>Area: {(calculateArea(bboxPolygon(bounds)) / 1000).toFixed(2)} km<sup>2</sup></p>
        </div>
      </div>
    )
  }

  onMapLoad (map) {
    const { bounds } = this.props
    if (!bounds) return
    querySavedOsm([[bounds[1], bounds[3]], [bounds[0], bounds[2]]], function (err, geojson) {
      if (err) return console.warn(err)
      map.addSource('osm', {
        type: 'geojson',
        data: geojson
      })
    })
  }
}

const mapStateToProps = ({ osmBounds, loading, errors }) => {
  return {
    loading,
    bounds: osmBounds.length ? osmBounds : null,
    error: errors.get('osmQuery')
  }
}

module.exports = connect(mapStateToProps)(CurrentSelection)
