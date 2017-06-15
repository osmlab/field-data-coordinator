'use strict'
const db = require('./db')
const bodyParser = require('body-parser')
const express = require('express')
const http = require('http')
const websocket = require('websocket-stream')
const eos = require('end-of-stream')

function Server (opts) {
  if (!(this instanceof Server)) return new Server(opts)

  opts = opts || {}
  opts.port = opts.port || 3210

  const routes = express()
  const server = http.createServer(routes)

  websocket.createServer({
    perMessageDeflate: false,
    server: server
  }, handleWebsocketStream)

  this.listen = function () {
    server.listen(opts.port)
  }

  routes.get('/observations/list', function (req, res) {
    db.listObservations(function (err, features) {
      if (err) return res.status(500).send(err.message)
      res.send(JSON.stringify(features))
    })
  })

  const jsonParser = bodyParser.json()
  routes.put('/observations/create', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400)
    db.createObservation(req.body, function (err) {
      if (err) return res.status(500).send(err.message)
      res.send(req.body)
    })
  })

  // osm-p2p-db replication endpoint
  function handleWebsocketStream (stream) {
    console.log('got a stream')
    var rs = db.createOsmReplicationStream()
    rs.pipe(stream).pipe(rs)

    let pending = 2
    eos(stream, done)
    eos(rs, done)

    function done (err) {
      if (--pending !== 0) return
      if (err) console.trace('replication failure', err)
      else console.log('replication success')
    }
  }
}

module.exports = Server
