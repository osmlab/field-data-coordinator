'use strict'

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
    const message = yield call(importOsm, bbox)
    console.log(message)
    yield put({ type: 'OSM_QUERY_SUCCESS', bbox })
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
