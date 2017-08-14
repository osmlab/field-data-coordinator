#!/usr/bin/env node
'use strict'

var path = require('path')
var electronInstaller = require('electron-winstaller')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var config = require('../config')

var releaseFolder = path.join(__dirname, '..', 'release')
var baseName = config.appName + '-win32-x64'
var buildName = 'installer-' + baseName
var installerFolder = path.join(releaseFolder, buildName)

function createConfiguration () {
  var buildFolder = path.join(releaseFolder, 'build-' + baseName)

  return {
    appDirectory: buildFolder,
    outputDirectory: installerFolder,

    usePackageJson: false,

    description: config.description,
    authors: config.teamName,
    name: config.appName,
    exe: config.appName + '.exe',
    setupExe: buildName + '-' + config.version + '.exe',
    iconUrl: 'https://raw.githubusercontent.com/digidem/mapfilter-desktop/master/static/mapfilter.ico',
    version: config.version,
    title: config.appName
  }
}

function createInstaller () {
  var cfg = createConfiguration()
  electronInstaller.createWindowsInstaller(cfg)
    .then(function () {
      console.log(path.join(cfg.outputDirectory, cfg.setupExe))
    }).catch(function (e) {
      console.error(e.message)
    })
}

function clear (dir, cb) {
  rimraf(dir, function (err) {
    if (err) return cb(err)
    mkdirp(dir, cb)
  })
}

console.log('gonna clear', installerFolder)
clear(installerFolder, function (err) {
  if (err) throw err
  createInstaller()
})
