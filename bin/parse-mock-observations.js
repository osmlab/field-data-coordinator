#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')
var data = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock/observations.json')))
data.forEach(function (d) {
  fs.writeFileSync(path.join(__dirname, 'observations', d.id + '.json'), JSON.stringify(d))
})
