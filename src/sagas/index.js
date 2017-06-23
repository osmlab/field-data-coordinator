'use strict'

const url = require('url')
const promisify = require('es6-promisify')
const request = promisify(require('request'))

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

const OSMAPI = 'http://api.openstreetmap.org/api/0.6/'

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
  const query = url.resolve(OSMAPI, `map?bbox=${bbox}`)
  let response
  try {
    response = yield call(request, query)
    yield put({ type: 'OSM_QUERY_SUCCESS', bbox })
  } catch (error) {
    yield put({ type: 'OSM_QUERY_FAILED', error })
    return
  }
  yield call(importOsm, response)
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
