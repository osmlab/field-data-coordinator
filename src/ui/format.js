'use strict'

// my friend => My Friend
module.exports.displayCase = (string) => string.split(' ').map(s => s[0].toUpperCase() + s.substr(1)).join(' ')
