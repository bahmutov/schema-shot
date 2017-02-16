'use strict'

const is = require('check-more-types')
const la = require('lazy-ass')
const R = require('ramda')
const schemaShot = require('..')

/* global describe, it */
describe('schema-shot example', () => {
  const person = {
    name: 'gleb',
    age: 37,
    married: true,
    lives: {
      city: 'Boston'
    }
  }

  const upperCasePerson = R.evolve({
    name: R.toUpper
  })(person)

  const immortalPerson = R.omit(['age'], person)

  // introduce some randomness into the test
  const getNamedPerson = () =>
    Math.random() < 0.5 ? person : upperCasePerson

  const getAgedPerson = () =>
    Math.random() < 0.5 ? person : immortalPerson

  it('does not care about name case', () => {
    const p = getNamedPerson()
    la(is.object(p))
    schemaShot(p)
  })

  it.skip('does care about missing age property', () => {
    const p = getAgedPerson()
    console.log(p)
    schemaShot(p)
    /*
      Catches passing person without age when schema has age,
      or passing person WITH age when schema was without it.

        Error: schema difference
        data.age: is required
    */
  })
})
