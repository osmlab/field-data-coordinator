'use strict'

const path = require('path')
const mkdirp = require('mkdirp')
const db = require('./lib/db')
const server = require('./lib/server')
const settings = require('electron-settings')
const electron = require('electron')
const app = electron.app
const Menu = electron.Menu
const BrowserWindow = electron.BrowserWindow

let main
function init () {
  main = createWindow()
  main.on('closed', function () {
    main = null
  })
  setupMenu()
  setupFileIPCs(main, electron.ipcMain, main.webContents)
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
  inChannel.on('upload-survey', uploadSurvey)

  function uploadSurvey () {
  }
}

const userDataPath = path.join(app.getPath('userData'), 'org.osm-labs.field-data-coordinator')
mkdirp.sync(userDataPath)
const dbPath = path.join(userDataPath, 'db')
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

// export the db object so we can remote require it on render threads
// https://github.com/electron/electron/blob/master/docs/api/remote.md
module.exports.db = db
