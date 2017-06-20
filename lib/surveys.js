'import strict'

const fs = require('fs')
const path = require('path')

const async = require('async')
const { app } = require('electron')
const eos = require('end-of-stream')
const JSONStream = require('JSONStream')
const mkdirp = require('mkdirp')
const once = require('once')
const slugify = require('slugify')
const tar = require('tar-stream')

function bundleSurvey (surveyDefinition, callback) {
  const bundle = tar.pack()
  const { name, version } = surveyDefinition
  const filename = `${slugify(name)}-${version}.tgz`

  mkdirp(path.join(app.getPath('userData'), 'surveys'), err => {
    if (err) {
      return callback(err)
    }

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
  })
}

const listSurveys = function (callback) {
  return fs.readdir(path.join(app.getPath('userData'), 'surveys'), function (
    err,
    entries
  ) {
    if (err) {
      return callback(err)
    }

    // uncompress so we can provide additional information
    return async.mapLimit(entries, 10, readSurvey, callback)
  })
}

const readSurvey = (filename, callback) => {
  if (filename.indexOf('.tgz') < 0) {
    filename += '.tgz'
  }

  callback = once(callback)
  const extract = tar.extract()
  eos(extract, callback)

  extract.on('entry', (header, stream, next) => {
    stream.on('end', next)

    if (header.name === 'survey.json') {
      stream.pipe(
        JSONStream.parse().on('data', data =>
          callback(
            null,
            Object.assign(data, {
              id: path.basename(filename, path.extname(filename))
            })
          )
        )
      )
    } else {
      stream.resume()
    }
  })

  fs
    .createReadStream(path.join(app.getPath('userData'), 'surveys', filename))
    .pipe(extract)
}

module.exports = {
  bundleSurvey,
  listSurveys,
  readSurvey
}
