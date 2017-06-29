var appDmg = require('appdmg')
var path = require('path')
var rimraf = require('rimraf')
var config = require('../config')

var releaseFolder = path.join(__dirname, '..', 'release')
var buildName = 'Installar_' + config.appName + '_v' + config.version
var dmgPath = path.join(releaseFolder, buildName + '_macOS.dmg')

function createConfiguration () {
  var installerFolder = path.join(releaseFolder, 'mapfilter-desktop-darwin-x64')
  var appPath = path.join(installerFolder, config.appFileName + '.app')

  return {
    basepath: __dirname,
    target: dmgPath,
    specification: {
      title: config.appName,
      icon: config.iconPath + '.icns',
      'icon-size': 128,
      contents: [
        { x: 122, y: 240, type: 'file', path: appPath },
        { x: 380, y: 240, type: 'link', path: '/Applications' },

        // Hide hidden icons out of view, for users who have hidden files shown.
        // https://github.com/LinusU/node-appdmg/issues/45#issuecomment-153924954
        { x: 50, y: 500, type: 'position', path: '.background' },
        { x: 100, y: 500, type: 'position', path: '.DS_Store' },
        { x: 150, y: 500, type: 'position', path: '.Trashes' },
        { x: 200, y: 500, type: 'position', path: '.VolumeIcon.icns' }
      ]
    }
  }
}

function createInstaller () {
  const config = createConfiguration()
  const dmg = appDmg(config)
  dmg.once('error', function (err) {
    console.error(err)
    process.exit(1)
  })
  dmg.once('finish', function (info) {
    console.log(config.target)
    process.exit(0)
  })
}

console.log('gonna clear', dmgPath)
rimraf(dmgPath, function (err) {
  if (err) throw err
  createInstaller()
})
