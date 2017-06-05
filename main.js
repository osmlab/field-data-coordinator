'use strict'

const path = require('path')
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(path.join('file://', __dirname, 'src/index.html'))
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(path.join('file://', __dirname, 'dist/index.html'))
  }

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

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
  if (mainWindow === null) {
    createWindow()
  }
})
