'use strict'

const debug = require('debug')('snap-shot')
const stackSites = require('stack-sites')
const callsites = require('callsites')
const la = require('lazy-ass')
const is = require('check-more-types')
const utils = require('./utils')
const {strip} = utils
const {train} = require('validate-by-example')
const snapShotCore = require('snap-shot-core')
const compare = require('./compare')
const findTestCaller = require('find-test-caller')

const isNode = Boolean(require('fs').existsSync)
const isBrowser = !isNode
const isCypress = isBrowser && typeof cy === 'object'

let fs
if (isNode) {
  fs = require('./file-system')
} else if (isCypress) {
  fs = require('./cypress-system')
} else {
  fs = require('./browser-system')
}

const opts = {
  show: Boolean(process.env.SHOW),
  dryRun: Boolean(process.env.DRY),
  update: Boolean(process.env.UPDATE)
}

const SNAP_SHOT_EXTENSION = '.schema-shot'

function getSpecFunction ({file, line}) {
  return findTestCaller({file, line, fs})
}

function snapshot (what, schemaFormats) {
  const sites = stackSites()
  if (sites.length < 3) {
    // hmm, maybe there is test (like we are inside Cypress)
    if (this && this.test && this.test.title) {
      debug('no callsite, but have test title "%s"', this.test.title)
      return this.test.title
    }
    const msg = 'Do not have caller function callsite'
    throw new Error(msg)
  }
  debug('%d callsite(s)', sites.length)

  const caller = sites[2]
  const file = caller.filename
  // TODO report function name
  // https://github.com/bahmutov/stack-sites/issues/1
  const line = caller.line
  const column = caller.column
  const message = `
    file: ${file}
    line: ${line},
    column: ${column}
  `
  debug(message)
  let {specName, specSource, startLine} =
    getSpecFunction({file, line, column})

  // maybe the "snapshot" function was part of composition
  // TODO handle arbitrary long chains by walking up to library code
  if (!specName) {
    const caller = sites[3]
    const file = caller.filename
    const line = caller.line
    const column = caller.column
    debug('trying to get snapshot from %s %d,%d', file, line, column)
    const out = getSpecFunction({file, line, column})
    specName = out.specName
    specSource = out.specSource
    startLine = out.startLine
  }

  if (!specName) {
    // make the file was transpiled. Try callsites search
    const sites = callsites()
    const caller = sites[1]
    const file = caller.getFileName()
    const line = caller.getLineNumber()
    const column = caller.getColumnNumber()
    debug('trying to get snapshot from callsite %s %d,%d', file, line, column)
    const out = getSpecFunction({file, line, column})
    specName = out.specName
    specSource = out.specSource
    startLine = out.startLine
  }

  if (!specName) {
    console.error('Problem finding caller')
    console.trace()

    const relativeName = fs.fromCurrentFolder(file)
    const msg = `Could not determine test for ${relativeName}
      line ${line} column ${column}`
    throw new Error(msg)
  }
  debug(`found spec name "${specName}" for line ${line} column ${column}`)
  la(is.unemptyString(specSource), 'could not get spec source from',
    file, 'line', line, 'column', column, 'named', specName)
  la(is.number(startLine), 'could not determine spec function start line',
    file, 'line', line, 'column', column, 'named', specName)

  // TODO do not store value that is too large?
  const store = value => {
    const schema = train(value, schemaFormats)
    schema.example = value
    return schema
  }

  const setOrCheckValue = any => {
    const value = strip(any)
    const returnedValue = snapShotCore({
      what: value,
      file,
      specName,
      compare,
      store,
      ext: SNAP_SHOT_EXTENSION,
      opts
    })

    return returnedValue
  }

  if (is.promise(what)) {
    return what.then(setOrCheckValue)
  } else {
    return setOrCheckValue(what)
  }
}

if (isBrowser) {
  // there might be async step to load test source code in the browser
  la(is.fn(fs.init), 'browser file system is missing init', fs)
  snapshot.init = fs.init
}

module.exports = snapshot
