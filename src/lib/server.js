'use strict'

const path = require('path')

const bodyParser = require('body-parser')
const { app: electronApp } = require('electron')
const express = require('express')
const expressWs = require('express-ws')
const websocketStreamify = require('websocket-stream')
const Bonjour = require('bonjour')
const eos = require('end-of-stream')

const db = require('./db')
const { listSurveys, readSurvey } = require('./surveys')

function Server (opts) {
  if (!(this instanceof Server)) return new Server(opts)

  opts = opts || {}
  opts.port = opts.port || 3210

  const app = express()
  expressWs(app)
  app.use(bodyParser.json())

  let bonjour
  let bonjourService

  this.listen = function () {
    app.listen(opts.port, function () {
      console.log(
        'Listening at http://%s:%d',
        this.address().address,
        this.address().port
      )

      bonjour = Bonjour()
      var serviceOpts = {
        name: 'field-data-coordinator-' + Math.random().toString().substring(5),
        type: 'osm-sync',
        port: opts.port
      }
      bonjourService = bonjour.publish(serviceOpts)
      bonjourService.start()
      bonjourService.on('up', () => console.log('service up'))
      bonjourService.on('down', () => console.log('service down'))
      bonjourService.on('error', (err) => console.log('service err', err))
    })
  }

  // list observations
  app.get('/observations/list', function (req, res, next) {
    return db.listObservations(function (err, features) {
      if (err) {
        return next(err)
      }

      return res.json(features)
    })
  })

  // create new observations
  app.put('/observations/create', function (req, res, next) {
    if (!req.body) return res.sendStatus(400)

    var fakeId = Math.random().toString().substring(2)
    return db.createObservation(req.body, fakeId, function (err) {
      if (err) {
        return next(err)
      }

      return res.send(req.body)
    })
  })

  // list survey definitions
  app.get('/surveys/list', function (req, res, next) {
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
  app.get('/surveys/:id', function (req, res, next) {
    return readSurvey(req.params.id, (err, survey) => {
      if (err) {
        return next(err)
      }

      return res.json(survey)
    })
  })

  // get a survey bundle
  app.get('/surveys/:id/bundle', function (req, res, next) {
    res.set('Content-Type', 'application/gzip')
    return res.sendFile(
      path.join(
        electronApp.getPath('userData'),
        'surveys',
        req.params.id + '.tgz'
      )
    )
  })

  app.ws('/replicate/observations', function (ws) {
    var stream = websocketStreamify(ws)
    handleWebsocketStream(stream, db.createObservationsReplicationStream(), err => {
      if (err) console.error('replication error', err)
    })
  })

  app.ws('/replicate/osm', function (ws) {
    var stream = websocketStreamify(ws)
    handleWebsocketStream(stream, db.createOsmOrgReplicationStream(), err => {
      if (err) console.error('replication error', err)
    })
  })

  // Replication endpoint to a specific osm-p2p-db
  function handleWebsocketStream (stream, rs, done) {
    console.log('got a replication stream')
    rs.pipe(stream).pipe(rs)

    let pending = 2
    eos(stream, onFinished)
    eos(rs, onFinished)

    function onFinished (err) {
      console.log('one side finished replicating')
      if (--pending !== 0) return
      if (err) console.trace('replication failure', err)
      else console.log('replication success')
      if (done) done(err)
    }
  }
}

module.exports = Server