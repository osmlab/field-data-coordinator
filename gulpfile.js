'use strict'

var browserify = require('browserify')
var gulp = require('gulp')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var reactify = require('reactify')
var envify = require('envify/custom')
var del = require('del')

gulp.task('clean', function (cb) {
  del(['src/dist', 'release'], cb)
})

gulp.task('bundle', function () {
  var b = browserify({
    entries: './src/index.js',
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
  .pipe(gulp.dest('src/dist/'))
})

gulp.task('html', function () {
  return gulp.src('./src/index.html')
  .pipe(gulp.dest('src/dist'))
})

gulp.task('assets', function () {
  return gulp.src('./src/assets/**/*', { 'base': './src' })
  .pipe(gulp.dest('src/dist'))
})

gulp.task('default', ['html', 'assets', 'bundle'])
