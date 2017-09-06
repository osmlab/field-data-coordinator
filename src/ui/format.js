'use strict'
const moment = require('moment')

const nope = '--'
module.exports.nullValue = nope
// my friend => My Friend
module.exports.displayCase = (string) => string.split(' ').map(s => s[0].toUpperCase() + s.substr(1)).join(' ')

module.exports.date = (datestring) => datestring ? moment(datestring).format('MM/DD/YY') : nope
module.exports.fullDate = (datestring) => datestring ? moment(datestring).format('HH:SS MM/DD/YY') : nope
module.exports.coordinates = (array) => {
  if (Array.isArray(array) && array.length === 2) {
    return array.map(d => isNaN(d) ? nope : (+d).toFixed(6)).join(', ')
  } else return nope
}
