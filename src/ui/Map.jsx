'use strict'
const React = require('react')
const mapboxgl = require('mapbox-gl')
const { connect } = require('react-redux')

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZWd5cHQiLCJhIjoiY2l6ZTk5YTNxMjV3czMzdGU5ZXNhNzdraSJ9.HPI_4OulrnpD8qI57P12tg'

class Map extends React.Component {
  constructor (props) {
    super(props)
    this.init = this.init.bind(this)
  }

  init (el) {
    this.map = new mapboxgl.Map({
      container: el,
      style: 'mapbox://styles/mapbox/satellite-v9'
    })
  }

  componentWillUnmount () {
    this.map = null
  }

  render () {
    return (
      <div className='map' ref={this.init} />
    )
  }
}

const mapStateToProps = state => ({ observations: state.observations })
module.exports = connect(mapStateToProps)(Map)
