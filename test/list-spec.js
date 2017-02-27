'use strict'

const la = require('lazy-ass')
const is = require('check-more-types')
const schemaShot = require('..')

/* global describe, it */
describe('validating list', () => {
  it('validates by object in the list', () => {
    const list = [
      {name: 'joe'},
      {name: 'amy'}
    ]
    schemaShot(list)
  })

  it('validates all items in the list before storing schema', () => {
    const list = [
      {name: 'joe', age: 20},
      {foo: 'amy'}
    ]
    const tryComputingSchema = () => {
      schemaShot(list)
    }
    la(is.raises(tryComputingSchema), 'should not allow invalid list', list)
  })

  it('list with complex objects', () => {
    const list = [
      {name: 'joe', age: 20, gender: 'male', present: true},
      {name: 'amy', age: 20, gender: 'female', present: false}
    ]
    schemaShot(list)
  })
})
