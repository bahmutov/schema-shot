'use strict'

import test from 'ava'
import schemaShot from '..'
import generate from 'fake-todos'

const generateP = () => {
  return Promise.resolve(generate(1)[0])
}

test('returns a todo', t => {
  const todos = generate(1)
  schemaShot(todos[0])
})

test('todo promise', async t => {
  const todo = await generateP()
  console.log('todo', todo)
  schemaShot(todo)
})

test('color vs text', t => {
  const item = {
    name: 'this is a name',
    color: '#ff00ff'
  }
  console.log('item', item)
  schemaShot(item)
})
