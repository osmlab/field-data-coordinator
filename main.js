'use strict'

const fs = require('fs')
const path = require('path')

const async = require('async')
const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')
const settings = require('electron-settings')
const eos = require('end-of-stream')
const mkdirp = require('mkdirp')
const { compileSurvey } = require('@mojodna/observe-tools')
const slugify = require('slugify')
const { pack } = require('tar-stream')

const db = require('./lib/db')
const server = require('./lib/server')

let main
function init () {
  main = createWindow()
  main.on('closed', function () {
    main = null
  })
  setupMenu()
  setupFileIPCs(main, ipcMain, main.webContents)
}

function createWindow () {
  const opts = Object.assign({}, settings.get('winBounds'))
  const win = new BrowserWindow(opts)
  if (process.env.NODE_ENV === 'development') {
    win.loadURL(path.join('file://', __dirname, 'src/index.html'))
    win.webContents.openDevTools()
  } else {
    win.loadURL(path.join('file://', __dirname, 'dist/index.html'))
  }
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

function setupFileIPCs (main, inChannel, outChannel) {
}

const dbPath = path.join(app.getPath('userData'), 'db')
mkdirp.sync(dbPath)
db.start(dbPath)
server.listen()

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

const listSurveys = function (callback) {
  return fs.readdir(path.join(app.getPath('userData'), 'surveys'), function (
    err,
    entries
  ) {
    if (err) {
      return callback(err)
    }

    // TODO uncompress so we can provide additional information
    return callback(null, entries)
  })
}

const surveyListSubscribers = []

ipcMain.on('subscribe-to-survey-list-updates', function (evt) {
  if (surveyListSubscribers.indexOf(evt.sender) < 0) {
    surveyListSubscribers.push(evt.sender)
  }
})

ipcMain.on('unsubscribe-from-survey-list-updates', function (evt) {
  surveyListSubscribers.splice(surveyListSubscribers.indexOf(evt.sender), 1)
})

app.on('survey-list-changed', function () {
  console.log('survey list updated')
  return listSurveys((err, surveys) => {
    if (err) {
      return console.warn(err.stack)
    }

    surveyListSubscribers.forEach(x => x.send('receive-survey-list', surveys))
  })
})

ipcMain.on('list-surveys', function (evt) {
  return listSurveys((err, surveys) => {
    if (err) {
      return console.warn(err.stack)
    }

    evt.sender.send('receive-survey-list', surveys)
  })
})

ipcMain.on('trigger-import-survey-dialog', function (evt) {
  return dialog.showOpenDialog(
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
})

function bundleSurvey (surveyDefinition, callback) {
  const bundle = pack()
  const { name, version } = surveyDefinition
  const filename = `${slugify(name)}-${version}.tgz`

  mkdirp(path.join(app.getPath('userData'), 'surveys'))

  const output = fs.createWriteStream(
    path.join(app.getPath('userData'), 'surveys', filename)
  )

  // call the callback when the stream ends, one way or another
  eos(output, callback)
  bundle.pipe(output)

  bundle.entry(
    {
      name: 'survey.json'
    },
    JSON.stringify(surveyDefinition)
  )

  bundle.finalize()
}

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

      app.emit('survey-list-changed')
    })
  })
})

// export the db object so we can remote require it on render threads
// https://github.com/electron/electron/blob/master/docs/api/remote.md
module.exports.db = db
