'use strict'
const moment = require('moment')

// my friend => My Friend
module.exports.displayCase = (string) => string.split(' ').map(s => s[0].toUpperCase() + s.substr(1)).join(' ')

module.exports.date = (datestring) => moment(datestring).format('MM/DD/YY')
module.exports.fullDate = (datestring) => moment(datestring).format('HH:SS MM/DD/YY')
