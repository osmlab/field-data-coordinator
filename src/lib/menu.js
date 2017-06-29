module.exports = function (app) {
  return [
    {
      label: app.getName(),
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
            app.emit('open-import-survey-dialog')
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
    }
  ]
}
