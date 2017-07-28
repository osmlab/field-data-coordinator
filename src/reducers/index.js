'use strict'

const { combineReducers } = require('redux')

const observations = require('./observations')
const observationTimestamps = require('./observation-timestamps')
const surveys = require('./surveys')
const osmBounds = require('./osm-bounds')
const loading = require('./loading')
const errors = require('./errors')

module.exports = combineReducers({
  observations,
  observationTimestamps,
  surveys,
  osmBounds,
  loading,
  errors
})
