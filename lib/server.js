'use strict'
const db = require('./db')
const bodyParser = require('body-parser')
const express = require('express')
const routes = express()
const server = require('http').createServer(routes)

module.exports = {
  listen
}

const CONFIG = { port: 3210 }
function listen () {
  server.listen(CONFIG.port)
}

routes.get('/observations/list', function (req, res) {
  db.listObservations(function (err, features) {
    if (err) return res.sendStatus(500)
    res.send(JSON.stringify(features))
  })
})

const jsonParser = bodyParser.json()
routes.put('/observations/create', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  db.createObservation(req.body, function (err) {
    if (err) return res.sendStatus(500)
    res.send(req.body)
  })
})
