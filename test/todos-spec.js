'use strict'

const snapshot = require('snap-shot')
const schemaShot = require('..')

/* global describe, it */
describe('fake-todos', () => {
  const generate = require('fake-todos')

  it.skip('returns a different todo', () => {
    const todos = generate(1)
    snapshot(todos[0])
    /*
      Fails of course, because every todo is different
        1) fake-todos returns a different todo:
           Error: snapshot difference
      {
        id: "4e040570-..." => "129a55b4-..."
        what: "do adults" => "skip chess"
      }
    */
  })

  it('returns a todo', () => {
    const todos = generate(1)
    schemaShot(todos[0])
  })
})
