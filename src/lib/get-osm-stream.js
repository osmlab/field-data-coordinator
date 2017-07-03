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
    } else if (body.indexOf('You requested too many nodes') === 0) {
      /* osm.org doesn't set an error code when the request contains too many nodes.
       * Instead it returns a message in the body.
       */
      cb(body)
    } else {
      const stream = new Readable()
      stream.push(body)
      stream.push(null)
      cb(null, stream)
    }
  })
}
