'use strict'
const { combineReducers } = require('redux')
const observations = require('./observations').default
module.exports = combineReducers({ observations })
