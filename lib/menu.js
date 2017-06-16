const { dialog } = require('electron')

module.exports = function (app) {
  return [{
    label: 'Electron',
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Import Survey...',
        accelerator: 'Command+Shift+O',
        click: function (menuItem, browserWindow, event) {
          return dialog.showOpenDialog({
            buttonLabel: 'Import',
            filters: [
              {
                name: 'Survey Definitions',
                extensions: ['yaml', 'yml']
              }
            ],
            properties: ['openFile']
          }, app.emit.bind(app, 'importSurvey'))
        }
      }
    ]
  },
  {
    role: 'editMenu'
  },
  {
    label: 'View',
    submenu: [
      {
        role: 'toggledevtools'
      }
    ]
  },
  {
    role: 'windowMenu'
  },
  {
    label: 'Help',
    role: 'help',
    submenu: []
  }]
}
