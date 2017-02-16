'use strict'

const is = require('check-more-types')
const la = require('lazy-ass')
const snapshot = require('snap-shot')

/* global describe, it */
describe('schema-shot', () => {
  const schemaShot = require('.')
  it('is a function', () => {
    la(is.fn(schemaShot))
  })

  it('returns schema object', () => {
    const o = {name: 'my name'}
    const schema = schemaShot(o)
    la(is.object(schema))
    snapshot(schema)
  })
})
