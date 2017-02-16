# schema-shot

> Framework-agnostic snapshot testing using "schema by example" for highly dynamic data

[![NPM][npm-icon] ][npm-url]

[![Build status][ci-image] ][ci-url]
[![semantic-release][semantic-image] ][semantic-url]
[![js-standard-style][standard-image]][standard-url]

If you like [snap-shot][snap-shot] (snapshot testing for any JS framework),
but have data that is hard to pin down, maybe this package will be useful.
Instead of storing *literal* data snapshot, it stores [json-schema][json-schema]
derived from a the snapshot object seen **first time** (using
[validate-by-example][validate-by-example] to derive it). Next time an object
arrives, it will be validated against the *schema*. Any missing property,
or new one will trigger an exception.

## Example

Imagine we are fetching most popular item from an API service. Obviously
it changes often, so we cannot just store it as a snapshot for direct
comparison. We could massage the data and derive
[invariant snapshots][snapshot testing], but that is boilerplate code!

Instead, use `schema-shot`!

```sh
npm install --save-dev schema-shot
```

In your test

```js
// spec.js
const schemaShot = require('schema-shot')
it('returns most popular item', () => {
  const top = api.getMostPopularItem()
  schemaShot(top)
})
```

Suppose first time it runs, the API returns `top = {id: '45a12e'}` - an object
with just its `id` property. The `__snapshots__/spec.js.schema-shot` file
will be saved with

```js
exports['returns most popular item 1'] = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "required": true
    }
  },
  "additionalProperties": false
}
```

Now imagine the same day later running again. The API returns something else,
but the object still has same *shape*, just a different id `{id: 8812f0}`.
This object passes the schema validation step.

A week later, the new API version gets deployed. Now it returns the top
item, but instead of `id` property, it returns `uuid` property. The test
will fail!

```sh
$ npm test
Error: schema difference
  data has additional properties
  data.id: is required
```

[json-schema]: http://json-schema.org/
[validate-by-example]: https://github.com/bahmutov/validate-by-example
[snapshot testing]: https://glebbahmutov.com/blog/snapshot-testing/

## Returned value is schema object

You can inspect or even [snap-shot][snap-shot] the schema object.

```js
const snapshot = require('snap-shot')
const schemaShot = require('schema-shot')
it('returns schema object', () => {
  const o = {name: 'my name'}
  const schema = schemaShot(o)
  snapshot(schema)
})
```

Both objects in this case will be

```js
{
  '$schema': 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    name: { type: 'string', required: true }
  },
  additionalProperties: false
}
```

## Inferred property formats

A more specific property formats are inferred, see
[validate-by-example#inferring-formats][inferring] and can be
[overridden][overridden].

```js
const person = {
  name: 'Joe Smith',
  email: 'joe@foo.com'
}
// let it infer that person.email has "email" format
schemaShot(person)
// or we can set it ourselves
schemaShot(person, {email: 'email'})
/*
  schema properties
  {
    name: {type: 'string', required: true},
    email: {type: 'string', required: true, format: 'email'}
  }
*/
```

[inferring]: https://github.com/bahmutov/validate-by-example#inferring-formats
[overridden]: https://github.com/bahmutov/validate-by-example#overriding-formats

## Difference with snapshot testing

The schema shots do not store the direct information. A good example is
a test using [snap-shot][snap-shot] and [fake-todos][fake-todos] in
[test/todos-spec.js](test/todos-spec.js). The snapshot test always fails
on the second run, because a returned todo is *different*. The JSON
schema on the other hand stays consistent, as long as *fake-todos*
returns objects with same shape.

```js
const snapshot = require('snap-shot')
const schemaShot = require('schema-shot')
const generate = require('fake-todos')
describe('fake-todos', () => {
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
```

[snap-shot]: https://github.com/bahmutov/snap-shot
[fake-todos]: https://github.com/bahmutov/fake-todos

### Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2017

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](http://glebbahmutov.com)
* [blog](http://glebbahmutov.com/blog)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/schema-shot/issues) on Github

## MIT License

Copyright (c) 2017 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[npm-icon]: https://nodei.co/npm/schema-shot.svg?downloads=true
[npm-url]: https://npmjs.org/package/schema-shot
[ci-image]: https://travis-ci.org/bahmutov/schema-shot.svg?branch=master
[ci-url]: https://travis-ci.org/bahmutov/schema-shot
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/
