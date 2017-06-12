'use strict'

module.exports.sync = () => ({ type: 'SYNC' })
module.exports.toggleFilterProperty = (property) => ({ type: 'TOGGLE_FILTER_PROPERTY', property })
