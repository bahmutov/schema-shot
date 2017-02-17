const la = require('lazy-ass')
const is = require('check-more-types')

const {validate} = require('validate-by-example')

function compare ({expected, value}) {
  const schema = expected
  const result = validate(schema, value)
  if (result.valid) {
    return {valid: true}
  }

  la(is.array(result.errors), 'invalid errors', result)

  const text = result.errors.map(o => `${o.field}: ${o.message}`).join('\n')
  const msg = `schema difference\n${text}`
  return {
    valid: false,
    message: msg
  }
}

module.exports = compare
