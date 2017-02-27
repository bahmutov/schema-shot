'use strict'

const schemaShot = require('..')

/* global describe, it */
describe('storing example object', () => {
  const person = {
    name: 'gleb',
    age: 37,
    married: true,
    lives: {
      city: 'Boston'
    }
  }

  it('stores training example', () => {
    schemaShot(person)
  })
})
