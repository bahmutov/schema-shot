'use strict'

const is = require('check-more-types')
const la = require('lazy-ass')

/* global describe, it */
describe('schema-shot', () => {
  const schemaShot = require('.')
  it('is a function', () => {
    la(is.fn(schemaShot))
  })
})
