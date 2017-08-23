'use strict'

const path = require('path')
const fs = require('fs')
const slugify = require('slugify')

const async = require('async')
const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')
const settings = require('electron-settings')
const mkdirp = require('mkdirp')
const { compileSurvey } = require('@mojodna/observe-tools')

const db = require('./lib/db')
const Server = require('./lib/server')
const { bundleSurvey, listSurveys } = require('./lib/surveys')
const { updateSurveyList, sync } = require('./actions')
const exportObservations = require('./lib/export')

const appPath = require('./lib/app-path')
const osmPresets = require('./data/osm-presets.json')

let main
let dispatch = () => console.warn('dispatch not yet connected')

function init () {
  main = createWindow()
  main.on('closed', function () {
    main = null
  })
  setupMenu()

  // wire up communication between threads so actions can be triggered from the main thread
  ipcMain.on('redux-initialized', ({ sender }) => {
    dispatch = payload => {
      sender.send('dispatch', payload)
    }
    console.log('redux store connection initialized')

    setupInitialSurvey(() => {
      // update the Redux store with the list of available surveys
      listSurveys((err, surveys) => {
        if (err) {
          return console.warn(err.stack)
        }
        return dispatch(updateSurveyList(surveys))
      })
    })
  })
}

function setupInitialSurvey (cb) {
  const { name, version } = osmPresets
  const filename = `${slugify(name)}-${version}.tgz`
  const defaultSurveyPath = path.join(appPath(), 'surveys', filename)
  fs.access(defaultSurveyPath, err => {
    if (err) {
      osmPresets._OBSERVE_DEFAULT_SURVEY = true
      bundleSurvey(osmPresets, err => {
        if (err) {
          console.warn(err.stack)
        } else {
          console.log('initialized default (OSM) survey')
        }
        cb()
      })
    } else {
      console.log('default (OSM) survey already exists')
      cb()
    }
  })
}

function createWindow () {
  const opts = Object.assign({}, settings.get('winBounds'))
  const win = new BrowserWindow(opts)
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }
  win.loadURL(path.join('file://', __dirname, 'index.html'))
  win.on('close', function () {
    settings.set('winBounds', win.getBounds())
  })
  return win
}

function setupMenu () {
  const template = require('./lib/menu')(app)
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // TODO see Darwin-specific menu configuration here for better Windows
  // behavior:
  // https://github.com/electron/electron/blob/master/docs/api/menu.md#main-process
}

const dbPath = path.join(appPath(), 'db')
mkdirp.sync(dbPath)
db.start(dbPath)

var server = new Server()
server.listen()
server.on('replicatedObservations', function () {
  dispatch(sync())
})

app.on('ready', init)

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (main === null) {
    init()
  }
})

const openImportSurveyDialog = () =>
  dialog.showOpenDialog(
    {
      buttonLabel: 'Import',
      filters: [
        {
          name: 'Survey Definitions',
          extensions: ['yaml', 'yml']
        }
      ],
      properties: ['openFile']
      // TODO emit seems like the wrong method
    },
    app.emit.bind(app, 'importSurvey')
  )

app.on('open-import-survey-dialog', openImportSurveyDialog)

app.on('importSurvey', function (files) {
  console.log('Importing survey(s)', files)
  return async.map(files, compileSurvey, (err, surveyDefinitions) => {
    if (err) {
      console.warn(err.stack)
    }

    // TODO fetch additional resources like icons, etc.

    return async.forEach(surveyDefinitions, bundleSurvey, err => {
      if (err) {
        return console.warn(err.stack)
      }

      return listSurveys((err, surveys) => {
        if (err) {
          return console.warn(err.stack)
        }

        return dispatch(updateSurveyList(surveys))
      })
    })
  })
})

const openExportXmlDialog = (observationIds) => {
  dialog.showSaveDialog(
    {
      buttonLabel: 'Export XML Changeset',
      defaultPath: 'observations.xml'
    },
    (filename) => exportObservations.xml(observationIds, filename)
  )
}

const openExportJsonDialog = (observationIds) => {
  dialog.showSaveDialog(
    {
      buttonLabel: 'Export JSON Changeset',
      defaultPath: 'observations.json'
    },
    (filename) => exportObservations.json(observationIds, filename)
  )
}

const openExportGeojsonDialog = (observationIds) => {
  dialog.showSaveDialog(
    {
      buttonLabel: 'Export GeoJSON',
      defaultPath: 'observations.geojson'
    },
    (filename) => exportObservations.geojson(observationIds, filename)
  )
}

const openExportCsvDialog = (observationIds) => {
  dialog.showSaveDialog(
    {
      buttonLabel: 'Export CSV',
      defaultPath: 'observations.csv'
    },
    (filename) => exportObservations.csv(observationIds, filename)
  )
}

const openExportShapefileDialog = (observationIds) => {
  dialog.showSaveDialog(
    {
      buttonLabel: 'Export Shapefile',
      defaultPath: 'observations.zip'
    },
    (filename) => exportObservations.shp(observationIds, filename)
  )
}

// export the db object so we can remote require it on render threads
// https://github.com/electron/electron/blob/master/docs/api/remote.md
module.exports = {
  db,
  listSurveys,
  openImportSurveyDialog,
  openExportXmlDialog,
  openExportJsonDialog,
  openExportGeojsonDialog,
  openExportCsvDialog,
  openExportShapefileDialog
}
