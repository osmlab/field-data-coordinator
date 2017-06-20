'use strict'

const http = require('http')
const path = require('path')

const bodyParser = require('body-parser')
const { app: electronApp } = require('electron')
const eos = require('end-of-stream')
const express = require('express')
const websocket = require('websocket-stream')

const db = require('./db')
const { listSurveys, readSurvey } = require('./surveys')

function Server (opts) {
  if (!(this instanceof Server)) return new Server(opts)

  opts = opts || {}
  opts.port = opts.port || 3210

  const routes = express()
  routes.use(bodyParser.json())
  const server = http.createServer(routes)

  websocket.createServer({
    perMessageDeflate: false,
    server: server
  }, handleWebsocketStream)

  this.listen = function () {
    server.listen(opts.port, function () {
      console.log(
        'Listening at http://%s:%d',
        this.address().address,
        this.address().port
      )
    })
  }

  // list observations
  routes.get('/observations/list', function (req, res, next) {
    return db.listObservations(function (err, features) {
      if (err) {
        return next(err)
      }

      return res.json(features)
    })
  })

  // create new observations
  routes.put('/observations/create', function (req, res, next) {
    if (!req.body) return res.sendStatus(400)

    return db.createObservation(req.body, function (err) {
      if (err) {
        return next(err)
      }

      return res.send(req.body)
    })
  })

  // list survey definitions
  routes.get('/surveys/list', function (req, res, next) {
    return listSurveys(function (err, surveys) {
      if (err) {
        return next(err)
      }

      return res.json(surveys.map(x => ({
        id: x.id,
        name: x.name,
        version: x.version
      })))
    })
  })

  // get a survey definition
  routes.get('/surveys/:id', function (req, res, next) {
    return readSurvey(req.params.id, (err, survey) => {
      if (err) {
        return next(err)
      }

      return res.json(survey)
    })
  })

  // get a survey bundle
  routes.get('/surveys/:id/bundle', function (req, res, next) {
    res.set('Content-Type', 'application/gzip')
    return res.sendFile(
      path.join(
        electronApp.getPath('userData'),
        'surveys',
        req.params.id + '.tgz'
      )
    )
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
