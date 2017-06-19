'use strict'
const test = require('tape')
const observationsReducer = require('../../src/reducers/observations')
const reducer = observationsReducer.default
const { getActiveFeatures, getFlattenedProperties } = observationsReducer
const { List } = require('immutable')
const observations = require('../fixtures/observations.json')

const SYNC = 'SYNC_SUCCESS'
const FILTER = 'TOGGLE_FILTER_PROPERTY'

test('observations reducers', function (t) {
  t.test('initial state', function (t) {
    const state = reducer(undefined, {})
    t.ok(state.get('active') instanceof List, 'active is an immutable list')
    t.ok(state.get('all') instanceof List, 'all is an immutable list')
    t.ok(state.get('filterProperties') instanceof List, 'filter properties is an immutable list')
    t.ok(state.get('_map') instanceof Object, '_map is a vanilla js object')
    t.end()
  })

  t.test('sync and filter', function (t) {
    const state0 = reducer(undefined, { type: SYNC, observations })
    const all = ['0', '1', '2']
    t.deepEqual(Object.keys(state0.get('_map')), all, '_map keys are ids')
    t.deepEqual(state0.get('active').toJS(), all, 'all ids are active with no filter')
    t.deepEqual(state0.get('all').toJS(), all, 'all ids are included')

    const state1 = reducer(state0, { type: FILTER, property: 'hearing' })
    t.deepEqual(state1.get('active').toJS(), ['0'], 'filters active ids')

    const state2 = reducer(state1, { type: FILTER, property: 'friendly' })
    t.equal(state2.get('active').size, 0, 'filters stack')

    const state3 = reducer(state2, { type: SYNC, observations: observations.slice(1, 3) })
    t.deepEqual(Object.keys(state3.get('_map')), ['1', '2'], '_map overwritten by sync')
    t.deepEqual(state3.get('all').toJS(), ['1', '2'], 'ids affected by new sync')
    t.equal(state3.get('active').size, 0, 'filters unaffected by new sync')
    t.end()
  })

  t.test('getActiveFeatures', function (t) {
    const state0 = reducer(undefined, { type: SYNC, observations })
    t.deepEqual(getActiveFeatures(state0).features, observations, 'returns all active features when no filter')
    const state1 = reducer(state0, { type: FILTER, property: 'hearing' })
    t.deepEqual(getActiveFeatures(state1).features, [observations[0]], 'returns filtered features with filter')
    t.end()
  })

  t.test('getFlattenedProperties', function (t) {
    const state0 = reducer(undefined, { type: SYNC, observations })
    const state1 = reducer(state0, { type: FILTER, property: 'hearing' })
    t.deepEqual(getFlattenedProperties(state1), {
      hearing: { engineer: 1 },
      friendly: { meet: 1 },
      numeral: { mouth: 1 }
    }, 'returns all properties even with a filter')
    t.end()
  })
  t.end()
})
