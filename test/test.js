const assert = require('assert')
const appliance = require('../modules/appliance')
const eventbuffer = require('../modules/eventbuffer')
const erds = require('../modules/erds')
const talkback = require('../modules/talkback')
const enums = require('../modules/enumerations')
const messages = require('../modules/messages')
const tts = require('../modules/tts')

describe('buffer', function () {
  it('should handle one value added', function (done) {
    let buffer = eventbuffer()
    let expectedOutPut = ['farts']
    buffer.onFinish(function (output) {
      assert.deepEqual(output, expectedOutPut)
      done()
    })
    buffer.add('farts')
  })
  it('should handle multiple values added in close succession', function (done) {
    let buffer = eventbuffer()
    let expectedOutPut = ['farts', 'farts']
    buffer.onFinish(function (output) {
      assert.deepEqual(output, expectedOutPut)
      done()
    })
    buffer.add(expectedOutPut[0])
    buffer.add(expectedOutPut[1])
  })
  it('should handle multiple spread out values', function (done) {
    let buffer = eventbuffer()
    let expectedFinishCount = 2
    let realCount = 0
    buffer.onFinish(function (output) {
      realCount += 1
      // Very smelly
      if (realCount === expectedFinishCount) {
        assert.equal(realCount, expectedFinishCount)
        done()
      }
    })
    buffer.add('this doesnt')
    setTimeout(function () {
      buffer.add('matter')
    }, 50)
  })
  it('should handle spread out groups of values', function (done) {
    let buffer = eventbuffer()
    let expectedFinishCount = 2
    let realCount = 0
    buffer.onFinish(function (output) {
      realCount += 1
      // Very smelly
      if (realCount === expectedFinishCount) {
        assert.equal(realCount, expectedFinishCount)
        done()
      }
    })
    buffer.add('this doesnt')
    buffer.add('this doesnt')
    setTimeout(function () {
      buffer.add('matter')
      buffer.add('matter')
    }, 50)
  })
})
describe('erds', function () {
  it('should return correct object for erd address', function () {
    let erd = erds.erd(0x2007)
    assert.ok(Array.isArray(erd.causes) && erd.data)
  })
  it('should throw error for invalid input', function () {
    assert.throws(function () {
      erds.erd('a gibberish value')
    },
    function (err) {
      return err instanceof Error
    })
  })
})
describe('appliance', function () {
  it('should contain buffer', function () {
    let testAppliance = appliance()
    assert.ok(testAppliance.buffer !== undefined)
  })
})
describe('talkback', function () {
  it('should contain start function', function () {
    assert.ok(talkback.start !== undefined)
  })
})
describe('enumerations', function () {
  it('should contain english set of enumerations', function () {
    assert.ok(enums.en !== undefined)
  })
  it('should contain english cycle enumeration', function () {
    assert.ok(enums.en.cycle !== undefined)
  })
  it('should contain spanish set of enumerations', function () {
    assert.ok(enums.es !== undefined)
  })
  it('should contain spanish cycle enumeration', function () {
    assert.ok(enums.es.cycle !== undefined)
  })
})
describe('messages', function () {
  it('should contain messages based on erd and language', function () {
    assert.ok(messages.en[erds.DEEP_FILL])
    assert.ok(messages.es[erds.DEEP_FILL])
  })
})
describe('tts', function () {
  it('should contain speak function', function (done) {
    assert.ok(tts.speak != undefined)
    tts.speak('Hello World', 'en-us', function () {
      done()
    })
  })
})
