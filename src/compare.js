const la = require('lazy-ass')
const is = require('check-more-types')
const diff = require('variable-diff')
const R = require('ramda')
const {validate, train} = require('validate-by-example')
const {stringify} = require('./utils')
const stripAnsi = require('strip-ansi')

const formatErrors = errors => {
  const text = errors.map(o => `${o.field}: ${o.message}`).join('\n')
  const msg = `schema difference\n${text}\n`
  return msg
}

const validateList = (schema, values) => {
  if (is.not.array(values)) {
    return {
      valid: false,
      message: 'expected an Array, got ' + typeof values
    }
  }
  let msg
  values.some(value => {
    const result = validate(schema, value)
    if (!result.valid) {
      msg = 'item in the list does not pass the schema\n' +
        formatErrors(result.errors) + '\n' + stringify(value)
      return true
    }
  })
  return {
    valid: msg === undefined,
    message: msg
  }
}

function additionalErrorInfo (expected, value) {
  let msg = ''
  if (expected.example) {
    msg += 'example used to derive JSON schema\n' + stringify(expected.example) + '\n'
  } else {
    msg += 'expected schema\n' + stringify(expected) + '\n'
  }
  msg += 'object right now\n' + stringify(value) + '\n'

  const schema = train(value)
  const difference = diff(R.omit(['example', 'list'])(expected), schema)
  msg += '*** schema difference ***\n' +
    stripAnsi(difference.text) +
    '*** end schema difference ***\n'

  return msg
}

function compare ({expected, value}) {
  const schema = expected
  if (schema.list) {
    return validateList(schema, value)
  }

  const result = validate(schema, value)
  if (result.valid) {
    return {valid: true}
  }

  la(is.array(result.errors), 'invalid errors', result)

  const message = formatErrors(result.errors) + additionalErrorInfo(expected, value)
  return {
    valid: false,
    message
  }
}

module.exports = compare
