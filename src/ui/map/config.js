const source = 'ACTIVE_OBSERVATIONS'
module.exports.SOURCE = source
module.exports.markerStyle = {
  id: 'observations',
  type: 'circle',
  source,
  paint: {
    'circle-radius': 7,
    'circle-color': '#555555'
  }
}

module.exports.hoverMarkerStyle = {
  id: 'observations-hover',
  type: 'circle',
  source,
  paint: {
    'circle-radius': 7,
    'circle-color': '#b10000'
  },
  filter: ['==', 'id', '']
}

module.exports.clusterMarkerStyle = {
  id: 'observation-clusters',
  type: 'circle',
  source,
  paint: {
    'circle-color': '#555555',
    'circle-radius': {
      property: 'point_count',
      type: 'interval',
      stops: [
        [0, 20],
        [100, 25],
        [750, 35]
      ]
    }
  },
  filter: ['has', 'point_count']
}

module.exports.clusterCountStyle = {
  id: 'cluster-count',
  type: 'symbol',
  source,
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12,
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold']
  },
  paint: {
    'text-color': '#ffffff'
  },
  filter: ['has', 'point_count']
}
