'use strict'
const { shell } = require('electron')

module.exports = function (event) {
  if (typeof event.preventDefault === 'function') {
    event.preventDefault()
  }
  const address = event.currentTarget.getAttribute('data-href')
  if (typeof address !== 'undefined') {
    shell.openExternal(address)
  }
}
