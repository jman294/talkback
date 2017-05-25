const assert = require('assert')
const appliance = require('../modules/appliance')
const eventbuffer = require('../modules/eventbuffer')
const erds = require('../modules/erds')
const talkback = require('../modules/talkback')

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
