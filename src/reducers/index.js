'use strict'
const { combineReducers } = require('redux')
const observations = require('./observations')
module.exports = combineReducers({ observations })
