'use strict'

var browserify = require('browserify')
var gulp = require('gulp')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var reactify = require('reactify')
var envify = require('envify/custom')
var del = require('del')

gulp.task('clean', function (cb) {
  del(['dist', 'release'], cb)
})

gulp.task('bundle', function () {
  var b = browserify({
    entries: 'src/index.js',
    debug: false,
    node: true,
    bundleExternal: true,
    transform: [reactify, envify({
      NODE_ENV: 'production'
    })]
  })

  return b.bundle()
  .pipe(source('index.js'))
  .pipe(buffer())
  .pipe(gulp.dest('dist'))
})

gulp.task('files', function () {
  const files = [
    'src/index.html',
    'src/config.js',
    'src/package.json',
    'src/main.js'
  ]
  return gulp.src(files)
  .pipe(gulp.dest('dist'))
})

gulp.task('folders', function () {
  const folders = [
    'src/assets/**/*',
    'src/lib/**/*',
    'src/actions/**/*',
    'src/node_modules/**/*'
  ]
  return gulp.src(folders, { 'base': 'src' })
  .pipe(gulp.dest('dist'))
})

gulp.task('default', ['files', 'folders', 'bundle'])
