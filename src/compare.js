const la = require('lazy-ass')
const is = require('check-more-types')
const {validate} = require('validate-by-example')
const {stringify} = require('./utils')

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

  let msg = formatErrors(result.errors)

  if (expected.example) {
    const example = expected.example
    msg += 'example used to derive JSON schema\n' + stringify(example) + '\n'
    msg += 'object right now\n' + stringify(value) + '\n'
  }

  return {
    valid: false,
    message: msg
  }
}

module.exports = compare
