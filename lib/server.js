'use strict'

const http = require('http')
const path = require('path')

const { app: electronApp } = require('electron')
const bodyParser = require('body-parser')
const express = require('express')

const db = require('./db')
const { listSurveys, readSurvey } = require('./surveys')

const app = express()
app.use(bodyParser.json())

const CONFIG = { port: 3210 }

function listen () {
  http.createServer(app).listen(CONFIG.port, function () {
    console.log(
      'Listening at http://%s:%d',
      this.address().address,
      this.address().port
    )
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

  return db.createObservation(req.body, function (err) {
    if (err) {
      return next(err)
    }

    return res.send(req.body)
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

// list survey definitions
app.get('/surveys/list', function (req, res, next) {
  return listSurveys(function (err, surveys) {
    if (err) {
      return next(err)
    }

    return res.json(surveys)
  })
})

module.exports = {
  listen
}
