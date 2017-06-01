const gea = require('gea-sdk')
const adapter = require('gea-adapter-usb')
const say = require('say')
const eventbuffer = require('./eventbuffer')
const erds = require('./erds')
const enums = require('./enumerations')

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
    pinNo: 4,
    timeInMins: 'unknown',
    name: 'washer',
  },
  {
    id: DRYER,
    buffer: eventbuffer(),
    oldCycle: 0,
    pinNo: 17,
    timeInMins: 'unknown',
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

      busSubscribe(bus, SOURCE, erds.CYCLE_SELECTED, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.CYCLE_SELECTED, [appliances[1]])
      busSubscribe(bus, SOURCE, erds.DRY_TEMP, appliances)
      busSubscribe(bus, SOURCE, erds.TIME_SECS, [appliances[1]])
      busSubscribe(bus, SOURCE, erds.TIME_MINS, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.WATER_TEMP, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.SOIL_LEVEL, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.SPIN_LEVEL, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.MACHINE_STATUS, appliances)
      busSubscribe(bus, SOURCE, erds.STAIN_PRETREAT, [appliances[0]])
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
    let ignored = []
    events.map(function (event) {
      ignored = ignored.concat(erds.erd(event.erd).causes)
    })
    events.map(function (event) {
      if (!ignored.includes(event.erd)) {
        handleSingleEvent(event, appliance)
      }
    })
  }

  function handleSingleEvent (event, appliance) {
    switch (event.erd) {
      case erds.TIME_SECS:
        handleTimeSecs(event, appliance)
        break
      case erds.TIME_MINS:
        handleTimeMins(event, appliance)
        break
      case erds.CYCLE_SELECTED:
        handleCycleSelected(event, appliance)
        break
      case erds.WATER_TEMP:
        handleWaterTemp(event, appliance)
        break
      case erds.SPIN_LEVEL:
        handleSpinLevel(event, appliance)
        break
      case erds.SOIL_LEVEL:
        handleSoilLevel(event, appliance)
        break
      case erds.MACHINE_STATUS:
        handleMachineStatus(event, appliance)
        break
      case erds.DRY_TEMP:
        handleDryTemp(event, appliance)
        break
      case erds.STAIN_PRETREAT:
        handleStainPretreat(event, appliance)
        break
    }
  }

  function handleTimeSecs (event, appliance) {
    appliance.timeInMins = Math.round(erds.erd(erds.TIME_SECS).data(event))
  }

  function handleTimeMins (event, appliance) {
    appliance.timeInMins = erds.erd(erds.TIME_MINS).data(event)
  }

  function handleCycleSelected (event, appliance) {
    let newCycle = erds.erd(erds.CYCLE_SELECTED).data(event)
    if (newCycle !== appliance.oldCycle) {
      say.speak(enums.makeReadable(enums.cycle[newCycle]), 'voice_us2_mbrola')
    }
    appliance.oldCycle = newCycle
  }

  function handleWaterTemp (event, appliance) {
    let waterTemp = erds.erd(erds.WATER_TEMP).data(event)
    say.speak('water temp: '+enums.waterTemp[waterTemp], 'voice_us2_mbrola')
  }

  function handleSpinLevel (event, appliance) {
    let spinLevel = erds.erd(erds.SPIN_LEVEL).data(event)
    say.speak('spin level: '+enums.spinLevel[spinLevel], 'voice_us2_mbrola')
  }

  function handleSoilLevel (event, appliance) {
    let soilLevel = erds.erd(erds.SPIN_LEVEL).data(event)
    say.speak('soil level: '+enums.soilLevel[soilLevel], 'voice_us2_mbrola')
  }

  function handleMachineStatus (event, appliance) {
    let machineStatus = erds.erd(erds.MACHINE_STATUS).data(event)
      if (machineStatus === 2) {
        appliance.inACycle = true
        if (appliance.startButton) {
          appliance.startButton = false
          say.speak(
              'Starting '
              .concat(appliance.oldCycle)
              .concat(', with an estimated ')
              .concat(appliance.timeInMins)
              .concat(' minutes left.')
              , 'voice_us2_mbrola')
        }
      } else {
        appliance.startButton = true
        appliance.inACycle = false
      }
  }

  function handleDryTemp (event, appliances) {
    let temp = erds.erd(erds.DRY_TEMP).data(event)
    say.speak('dry temp: '+enums.dryTemp[temp], 'voice_us2_mbrola')
  }

  function handleStainPretreat (event, appliance) {
    let level = erds.erd(erds.STAIN_PRETREAT).data(event)
    say.speak('stain pretreat: '+enums.stainPretreat[level], 'voice_us2_mbrola')
  }

  return {
    start,
    appliances
  }

})()

module.exports = talkback
