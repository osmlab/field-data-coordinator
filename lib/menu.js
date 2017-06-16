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
    submenu: [
      {
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
