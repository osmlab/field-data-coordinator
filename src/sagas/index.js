'use strict'

const url = require('url')

const {
  call,
  put,
  takeLatest,
  takeEvery,
  all
} = require('redux-saga/effects')

const {
  listObservations,
  importSurvey
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

function * getOSM ({bounds}) {
  yield put({ type: 'OSM_QUERY_START' })
  const query = url.resolve(OSMAPI, `map?bbox=${bounds.join(',')}`)
  try {
    const xml = yield call(global.fetch, query)
    yield put({ type: 'OSM_QUERY_SUCCESS', xml })
  } catch (error) {
    yield put({ type: 'OSM_QUERY_FAILED', error })
  }
}

function * watchOSM () {
  yield takeEvery('GET_OSM', getOSM)
}

function * watchSurveys () {
  yield takeLatest('IMPORT_SURVEY', importSurvey)
}

function * watchSync () {
  yield takeLatest('SYNC', getObservations)
}

function * rootSaga () {
  yield all([watchSurveys(), watchSync(), watchOSM()])
}

module.exports = {
  getObservations,
  watchSync,
  rootSaga
}
