'use strict'

const { List } = require('immutable')
const initialState = List()

module.exports = function (state = initialState, { type, ids }) {
  if (type === 'TIMESTAMP_SYNC_SUCCESS') {
    return List(ids)
  } else return state
}
