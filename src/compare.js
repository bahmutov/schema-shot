const la = require('lazy-ass')
const is = require('check-more-types')
const {validate} = require('validate-by-example')
const {stringify} = require('./utils')

function compare ({expected, value}) {
  const schema = expected
  const result = validate(schema, value)
  if (result.valid) {
    return {valid: true}
  }

  la(is.array(result.errors), 'invalid errors', result)

  const text = result.errors.map(o => `${o.field}: ${o.message}`).join('\n')
  let msg = `schema difference\n${text}\n`

  if (expected.example) {
    msg += 'example used to derive JSON schema\n' +
      stringify(expected.example) + '\n'
    msg += 'object right now\n' + stringify(value) + '\n'
  }

  return {
    valid: false,
    message: msg
  }
}

module.exports = compare
