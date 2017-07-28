'use strict'
const promisify = require('es6-promisify')
const persist = promisify(window.require('electron-json-storage').set)
const randombytes = require('randombytes')
const {
  call,
  put,
  takeLatest,
  takeEvery,
  all
} = require('redux-saga/effects')

const {
  listObservations,
  importSurvey,
  importOsm
} = require('../drivers/local')
const { osmMetaFilename } = require('../config')

function * getObservations () {
  try {
    const observations = yield call(listObservations)
    yield put({ type: 'SYNC_SUCCESS', observations })
  } catch (error) {
    yield put({ type: 'SYNC_FAILED', error })
  }
}

function * getOsm ({bounds}) {
  yield put({ type: 'OSM_QUERY_START' })
  const bbox = bounds.join(',')
  try {
    yield call(importOsm, bbox)
    const timestamp = new Date().toISOString()
    yield call(persist, osmMetaFilename, {
      bounds,
      timestamp,
      uuid: `${timestamp}__${bbox}__${randombytes(8).toString('hex')}`
    })
    yield put({ type: 'OSM_QUERY_SUCCESS', bounds })
  } catch (error) {
    yield put({ type: 'OSM_QUERY_FAILED', error })
  }
}

function * watchOsm () {
  yield takeEvery('GET_OSM', getOsm)
}

function * watchSurveys () {
  yield takeLatest('IMPORT_SURVEY', importSurvey)
}

function * watchSync () {
  yield takeLatest('SYNC', getObservations)
}

function * rootSaga () {
  yield all([watchSurveys(), watchSync(), watchOsm()])
}

module.exports = {
  getObservations,
  watchSync,
  rootSaga
}
