const loudness = require('loudness')
const gea = require('gea-sdk')
const adapter = require('gea-adapter-usb')
const say = require('say')
const player = require('play-sound')({})
//const gpio = require('rpi-gpio')
const eventbuffer = require('./eventbuffer')
const erds = require('./erds')

const talkback = (function () {
  const app = gea.configure({
    address: 0xCB,
    version: [0, 0, 1, 0]
  })

  const WASHER = 0x23
  const DRYER = 0x2b

  const SOURCE = 0xcb

  let appliances = [
  {
    id: WASHER,
    buffer: eventbuffer(),
    oldCycle: 0,
    name: 'washer',
  },
  {
    id: DRYER,
    buffer: eventbuffer(),
    oldCycle: 0,
    name: 'dryer'
  }
  ]

  function start () {
    app.bind(adapter, function (bus) {
      bus.on('publish', function (erd) {
        appliances.map(function (appliance) {
          if (appliance.id === erd.source) {
            appliance.buffer.add(erd)
          }
        })
      })

      //busSubscribe(bus, SOURCE, TIME_SECS, [appliances[1]])
      //busSubscribe(bus, SOURCE, TIME_MINS, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.CYCLE_SELECTED, appliances)
      busSubscribe(bus, SOURCE, erds.WATER_TEMP, [appliances[0]])
      //busSubscribe(bus, SOURCE, SOIL_LEVEL, appliances[0])
      //busSubscribe(bus, SOURCE, SPIN_LEVEL, appliances[0])
      //busSubscribe(bus, SOURCE, MACHINE_STATUS, appliances)
    })

    appliances.map(function (appliance) {
      appliance.buffer.onFinish(function (buffer) {
        onEvents(buffer, appliance)
      })
    })
  }

  function busSubscribe(bus, source, erd, appliances) {
    appliances.map(function (appliance) {
      bus.subscribe({
        erd: erd,
        source: source,
        destination: appliance.id
      })
    })
  }

  function onEvents (events, appliance) {
    if (events.length > 1) {
      handleMultipleEvents(events, appliance)
    } else {
      handleSingleEvent(events[0], appliance)
    }
  }

  function handleMultipleEvents (events, appliance) {
    events.map(function (event) {
      if (erds.erd(event.erd).priority) {
        handleSingleEvent(event, appliance)
      }
    })
  }

  function handleSingleEvent (event, appliance) {
    switch (event.erd) {
      case erds.CYCLE_SELECTED:
        handleCycleSelected(event, appliance)
        break
      case erds.WATER_TEMP:
        handleWaterTemp(event, appliance)
        break
    }
  }

  function handleCycleSelected (event, appliance) {
    let newCycle = erds.erd(erds.CYCLE_SELECTED).data(event)
    if (newCycle !== appliance.oldCycle) {
      console.log(newCycle)
      say.speak(newCycle, 'voice_us2_mbrola')
    }
    appliance.oldCycle = newCycle
  }

  function handleWaterTemp (event, appliance) {
    let waterTemp = erds.erd(erds.WATER_TEMP).data(event)
    console.log(waterTemp)
  }

  return {
    start,
    appliances
  }

})()

module.exports = talkback
