'use strict'
const { call, put, takeLatest, all } = require('redux-saga/effects')
const { listObservations } = require('../drivers/local')

function * getObservations () {
  try {
    const observations = yield call(listObservations)
    yield put({ type: 'SYNC_SUCCESS', observations })
  } catch (error) {
    yield put({ type: 'SYNC_FAILED', error })
  }
}

function * watchSync () {
  yield takeLatest('SYNC', getObservations)
}

function * rootSaga () {
  yield all([
    watchSync()
  ])
}

module.exports = {
  getObservations,
  watchSync,
  rootSaga
}
