const gea = require('gea-sdk')
const adapter = require('gea-adapter-usb')
const say = require('say')
const eventbuffer = require('./eventbuffer')
const erds = require('./erds')
const enums = require('./enumerations')
const messages = require('./messages')
const tts = require('./tts')

const talkback = (function () {
  let lang = 'en'
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

      bus.on('read-response', function (erd) {
        appliances.map(function (appliance) {
          if (appliance.id === erd.source) {
            switch (erd.erd) {
              case erds.WATER_TEMP:
                appliance.waterTemp = enums[lang].waterTemp[erds.erd(erds.WATER_TEMP).data(erd)]
                break
              case erds.SPIN_LEVEL:
                appliance.spinLevel = enums[lang].spinLevel[erds.erd(erds.SPIN_LEVEL).data(erd)]
                break
              case erds.SOIL_LEVEL:
                appliance.soilLevel = enums[lang].soilLevel[erds.erd(erds.SOIL_LEVEL).data(erd)]
                break
              case erds.DRY_TEMP:
                appliance.dryTemp = enums[lang].dryTemp[erds.erd(erds.DRY_TEMP).data(erd)]
                break
            }
          }
        })
      })

      busRead(bus, SOURCE, erds.DRY_TEMP, [appliances[1]])
      busRead(bus, SOURCE, erds.WATER_TEMP, [appliances[0]])
      busRead(bus, SOURCE, erds.SOIL_LEVEL, [appliances[0]])
      busRead(bus, SOURCE, erds.SPIN_LEVEL, [appliances[0]])

      //busSubscribe(bus, SOURCE, erds.LOAD_SIZE, [appliances[0]])

      busSubscribe(bus, SOURCE, erds.CYCLE_SELECTED, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.CYCLE_SELECTED, [appliances[1]])
      busSubscribe(bus, SOURCE, erds.MACHINE_STATUS, appliances)

      busSubscribe(bus, SOURCE, erds.TIME_SECS, [appliances[1]])
      busSubscribe(bus, SOURCE, erds.TIME_MINS, [appliances[0]])

      busSubscribe(bus, SOURCE, erds.WATER_TEMP, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.SOIL_LEVEL, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.SPIN_LEVEL, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.DEEP_FILL, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.WARM_RINSE, [appliances[0]])
      busSubscribe(bus, SOURCE, erds.EXTRA_RINSE, [appliances[0]])

      busSubscribe(bus, SOURCE, erds.DRY_TEMP, [appliances[1]])
    })

    appliances.map(function (appliance) {
      appliance.buffer.onFinish(function (buffer) {
        onEvents(buffer, appliance)
      })
    })
  }

  function busRead (bus, source, erd, appliances) {
    appliances.map(function (appliance) {
      bus.read({
        erd: erd,
        source: source,
        destination: appliance.id
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
      //if (!ignored.includes(event.erd)) {
        //handleSingleEvent(event, appliance)
      //}
      handleSingleEvent(event, appliance, ignored.includes(event.erd))
    })
  }

  function handleSingleEvent (event, appliance, effect) {
    switch (event.erd) {
      case erds.TIME_SECS:
        handleTimeSecs(event, appliance, effect)
        break
      case erds.TIME_MINS:
        handleTimeMins(event, appliance, effect)
        break
      case erds.CYCLE_SELECTED:
        handleCycleSelected(event, appliance, effect)
        break
      case erds.WATER_TEMP:
        handleWaterTemp(event, appliance, effect)
        break
      case erds.SPIN_LEVEL:
        handleSpinLevel(event, appliance, effect)
        break
      case erds.SOIL_LEVEL:
        handleSoilLevel(event, appliance, effect)
        break
      case erds.LOAD_SIZE:
        handleLoadSize(event, appliance, effect)
        break
      case erds.MACHINE_STATUS:
        handleMachineStatus(event, appliance, effect)
        break
      case erds.DRY_TEMP:
        handleDryTemp(event, appliance, effect)
        break
      case erds.STAIN_PRETREAT:
        handleStainPretreat(event, appliance, effect)
        break
      case erds.DEEP_FILL:
        handleDeepFill(event, appliance, effect)
        break
      case erds.EXTRA_RINSE:
        //handleExtraRinse(event, appliance, effect)
        handleDeepRinse(event, appliance, effect)
        break
      case erds.DEEP_RINSE:
        handleDeepRinse(event, appliance, effect)
        break
      case erds.DELAY_WASH:
        handleDelayWash(event, appliance, effect)
        break
      case erds.WARM_RINSE:
        handleWarmRinse(event, appliance, effect)
        break
      case erds.SOAK:
        handleSoak(event, appliance, effect)
        break
      case erds.VOLUME:
        handleVolume(event, appliance, effect)
        break
      case erds.STAIN:
        handleStain(event, appliance, effect)
        break
    }
  }

  function handleTimeSecs (event, appliance, effect) {
    appliance.timeInMins = Math.round(erds.erd(erds.TIME_SECS).data(event))
  }

  function handleTimeMins (event, appliance, effect) {
    appliance.timeInMins = erds.erd(erds.TIME_MINS).data(event)
  }

  function handleCycleSelected (event, appliance, effect) {
    let newCycle = erds.erd(erds.CYCLE_SELECTED).data(event)
    if (newCycle !== appliance.oldCycle) {
      if (!effect) {
        tts.speak(enums.makeReadable(enums[lang].cycle[newCycle]), lang)
      }
    }
    appliance.oldCycle = newCycle
  }

  function handleWaterTemp (event, appliance, effect) {
    let waterTemp = erds.erd(erds.WATER_TEMP).data(event)
    appliance.waterTemp = enums[lang].waterTemp[waterTemp]
    if (!effect) {
      tts.speak(messages[lang][erds.WATER_TEMP]
                .replace('%1', appliance.waterTemp), lang)
    }
  }

  function handleSpinLevel (event, appliance, effect) {
    let spinLevel = erds.erd(erds.SPIN_LEVEL).data(event)
    appliance.spinLevel = enums[lang].spinLevel[spinLevel]
    if (!effect) {
      tts.speak(messages[lang][erds.SPIN_LEVEL]
                .replace('%1', appliance.spinLevel), lang)
    }
  }

  function handleSoilLevel (event, appliance, effect) {
    let soilLevel = erds.erd(erds.SOIL_LEVEL).data(event)
    appliance.soilLevel = enums[lang].soilLevel[soilLevel]
    if (!effect) {
      tts.speak(messages[lang][erds.SOIL_LEVEL]
                .replace('%1', appliance.soilLevel), lang)
    }
  }

  function handleLoadSize (event, appliance, effect) {
    let loadSize = erds.erd(erds.LOAD_SIZE).data(event)
    appliance.loadSize = enums[lang].loadSize[loadSize]
    if (!effect) {
      tts.speak(messages[lang][erds.LOAD_SIZE]
                .replace('%1', appliance.loadSize), lang)
    }
  }

  function handleMachineStatus (event, appliance, effect) {
    let machineStatus = erds.erd(erds.MACHINE_STATUS).data(event)
    appliance.machineStatus = enums[lang].machineStatus[machineStatus]
    if (machineStatus === 2) {
      appliance.inACycle = true
      if (appliance.startButton) {
        appliance.startButton = false
        if (!effect) {
          tts.speak(
              messages[lang][erds.MACHINE_STATUS]
              .replace('%1', enums.makeReadable(enums[lang].cycle[appliance.oldCycle]))
              .replace('%2', appliance.timeInMins)
              , lang
          )
        }
      }
    } else {
      appliance.startButton = true
      appliance.inACycle = false
    }
  }

  function handleDryTemp (event, appliance, effect) {
    let temp = erds.erd(erds.DRY_TEMP).data(event)
    appliance.dryTemp = enums[lang].dryTemp[temp]
    if (!effect) {
      tts.speak(messages[lang][erds.DRY_TEMP].replace('%1', appliance.dryTemp))
    }
  }

  function handleStainPretreat (event, appliance, effect) {
    let level = erds.erd(erds.STAIN_PRETREAT).data(event)
    if (!effect) {
      tts.speak(messages[lang][erds.STAIN_PRETREAT]
                .replace('%1', enums[lang].stainPretreat[level]), lang)
    }
  }

  function handleDeepFill (event, appliance, effect) {
    let state = erds.erd(erds.DEEP_FILL).data(event)
    if (!effect) {
      tts.speak(messages[lang][erds.DEEP_FILL]
                .replace('%1', enums[lang].deepFill[state]), lang)
    }
  }

  function handleExtraRinse (event, appliance, effect) {
    let state = erds.erd(erds.EXTRA_RINSE).data(event)
    if (!effect) {
      tts.speak(messages[lang][erds.EXTRA_RINSE]
                .replace('%1', enums[lang].extraRinse[state]), lang)
    }
  }

  function handleDeepRinse (event, appliance, effect) {
    let state = erds.erd(erds.DEEP_RINSE).data(event) || 0
    if (!effect) {
      tts.speak(messages[lang][erds.DEEP_RINSE]
                .replace('%1', enums[lang].deepRinse[state]), lang)
    }
  }

  function handleDelayWash (event, appliance, effect) {
    let state = erds.erd(erds.DELAY_WASH).data(event)
    if (!effect) {
      tts.speak(messages[lang][erds.DELAY_WASH]
                .replace('%1', enums[lang].deepFill[state]), lang)
    }
  }

  function handleWarmRinse (event, appliance, effect) {
    let state = erds.erd(erds.WARM_RINSE).data(event)
    if (!effect) {
      tts.speak(messages[lang][erds.WARM_RINSE]
                .replace('%1', enums[lang].deepFill[state]), lang)
    }
  }

  function handleSoak (event, appliance, effect) {
    let state = erds.erd(erds.SOAK).data(event)
    if (!effect) {
      tts.speak(messages[lang][erds.SOAK]
                .replace('%1', enums[lang].deepFill[state]), lang)
    }
  }

  function handleVolume (event, appliance, effect) {
    let state = erds.erd(erds.VOLUME).data(event)
    if (!effect) {
      tts.speak(messages[lang][erds.VOLUME]
                .replace('%1', enums[lang].deepFill[state]), lang)
    }
  }

  function handleStain (event, appliance, effect) {
    let state = erds.erd(erds.STAIN).data(event)
    if (!effect) {
      tts.speak(messages[lang][erds.STAIN]
                .replace('%1', enums[lang].deepFill[state]), lang)
    }
  }

  return {
    start,
    lang,
    appliances
  }

})()

module.exports = talkback
