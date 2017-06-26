'use strict'

const { combineReducers } = require('redux')

const observations = require('./observations').default
const surveys = require('./surveys')
const osm = require('./osm')

module.exports = combineReducers({
  observations,
  surveys,
  osm
})
