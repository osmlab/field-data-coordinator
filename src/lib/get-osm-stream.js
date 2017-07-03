'use strict'
const url = require('url')
const request = require('request')
const Readable = require('stream').Readable
const { osmapi } = require('../config')

// Query the osm api using a bounding box string, returns a readable stream
module.exports = function getOsmStream (bbox, cb) {
  const queryUrl = url.resolve(osmapi, `map?bbox=${bbox}`)
  request(queryUrl, function (err, response, body) {
    if (err) {
      cb(err)
    } else if (response.statusCode >= 400) {
      cb(body)
    } else {
      const stream = new Readable()
      stream.push(body)
      stream.push(null)
      cb(null, stream)
    }
  })
}
