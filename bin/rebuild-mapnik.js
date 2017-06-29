#!/usr/bin/env node
'use strict'

var exec = require('npm-execspawn')

var child = exec('cd node_modules/mapnik && node-gyp rebuild --target=1.7.3 --runtime=electron --arch=x64 --dist-url=https://atom.io/download/electron', { env: { HOME: '~/.electron-gyp' } })
child.stderr.pipe(process.stderr)
child.stdout.pipe(process.stdout)
