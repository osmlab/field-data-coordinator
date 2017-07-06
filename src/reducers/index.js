'use strict'

const { combineReducers } = require('redux')

const observations = require('./observations').default
const surveys = require('./surveys')
const osmBounds = require('./osm-bounds')
const loading = require('./loading')
const errors = require('./errors')

module.exports = combineReducers({
  observations,
  surveys,
  osmBounds,
  loading,
  errors
})
