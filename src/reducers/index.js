'use strict'

const { combineReducers } = require('redux')

const observations = require('./observations').default
const surveys = require('./surveys')
const osmBounds = require('./osm-bounds')
const loading = require('./loading')

module.exports = combineReducers({
  observations,
  surveys,
  osmBounds,
  loading
})
