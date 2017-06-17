'use strict'

const { combineReducers } = require('redux')

const observations = require('./observations').default
const surveys = require('./surveys')

module.exports = combineReducers({
  observations,
  surveys
})
