'use strict'
const { combineReducers } = require('redux-immutable')
const observations = require('./observations')
module.exports = combineReducers({ observations })
