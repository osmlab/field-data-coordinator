'use strict'
const url = require('url')
const http = require('http')
const { osmapi } = require('../config')

// Query the osm api using a bounding box string, returns a readable stream
module.exports = function getOsmStream (bbox, cb) {
  const queryUrl = url.resolve(osmapi, `map?bbox=${bbox}`)
  console.log('fetching', queryUrl)
  http.get(queryUrl, (res) => {
    const { statusCode } = res
    console.log('received response with code', statusCode)
    if (statusCode >= 400) {
      var body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        if (body.length) cb(new Error(body))
        else cb(new Error(`Failed http request to ${osmapi} with status code ${statusCode}`))
      })
    } else {
      cb(null, res)
    }
  })
}
