var gea = require('gea-sdk')
var adapter = require('gea-adapter-usb')
var say = require('say')
var player = require('play-sound')({})
var gpio = require('rpi-gpio')

var app = gea.configure({
  address: 0xcb,
  version: [ 0, 0, 1, 0 ]
})

gpio.on('change', function (channel, value) {
  states[0].sayTime = true
  console.log('button')
})
gpio.setup(7, gpio.DIR_IN, gpio.EDGE_BOTH)

var SOURCE = 0xcb

var WASHER = 0x23
var DRYER = 0x2b

var TIME_SECS = 0x2007
var TIME_MINS = 0x0046
var CYCLE_SELECTED = 0x200A
var END_CYCLE = 0x2002
var WATER_TEMP = 0x2016
var MACHINE_STATUS = 0x2000

var states = [
  {
    id: WASHER,
    oldCycle: 0,
    cycleRunAlert: false,
    oldMinutesRemaining: 0,
    name: 'washer'
  },
  {
    id: DRYER,
    oldCycle: 0,
    cycleRunAlert: false,
    oldMinutesRemaining: 0,
    name: 'dryer'
  }
]

app.bind(adapter, function (bus) {
  bus.on('publish', function (erd) {
    switch (erd.erd) {
      case MACHINE_STATUS:
        var machineStatus = erd.data[0]
        for (var state in states) {
          if (erd.source === states[state].id) {
            if (machineStatus === 2) {
              if (states[state].cycleRunAlert) {
                states[state].cycleRunAlert = false
                say.speak(
                    'Starting '
                    .concat(getReadableCycleName(states[state].oldCycle))
                    .concat(', with an estimated ')
                    .concat(states[state].oldMinutesRemaining)
                    .concat(' minutes remaining.')
                )
              }
            } else {
              states[state].cycleRunAlert = true
            }
          }
        }
        break

      case WATER_TEMP:
        var tempCode = erd.data[0]
        console.log(tempCode)
        say.speak('Water temperature, '.concat(getTempByCode(tempCode)))
        break

      case TIME_SECS:
        var bytes = erd.data
        for (var state in states) {
          if (erd.source === states[state].id) {
            var minutes = Math.round((bytes[0]*255 + bytes[1])/60)
            states[state].oldMinutesRemaining = minutes
          }
        }
        break

      case TIME_MINS:
        var timeRemaining = erd.data[1]
        for (var state in states) {
          if (erd.source === states[state].id) {
            states[state].oldMinutesRemaining = timeRemaining
            if (states[state].sayTime) {
              say.speak(timeRemaining + ' minutes left', 0.1)
              states[state].sayTime = false
            }
          }
        }
        break

      case CYCLE_SELECTED:
        var cycleSelected = erd.data[0]
        for (var state in states) {
          if (erd.source === states[state].id) {
            if (cycleSelected !== states[state].oldCycle) {
                  // console.log('new', states[state].name, 'cycle:', cycleSelected)
              say.speak(getReadableCycleName(cycleSelected))
            } else {
                  // console.log('same cycle')
            }
            states[state].oldCycle = cycleSelected
          }
        }
        break

      case END_CYCLE:
        var cycleEnd = erd.data[0]
        for (var state in states) {
          if (erd.source === states[state].id) {
              // states[state].
          }
        }
        break
    }
  })
  busSubscribe(bus, SOURCE, TIME_SECS, [DRYER])
  busSubscribe(bus, SOURCE, TIME_MINS, [WASHER])
  busSubscribe(bus, SOURCE, CYCLE_SELECTED, [WASHER, DRYER])
  busSubscribe(bus, SOURCE, WATER_TEMP, [WASHER, DRYER])
  busSubscribe(bus, SOURCE, MACHINE_STATUS, [WASHER, DRYER])
})

function busSubscribe (bus, source, erd, destinations) {
  destinations.map(function (dest) {
    bus.subscribe({
      erd: erd,
      source: source,
      destination: dest
    })
  })
}

var busRead = function (bus, source, erd, destinations) {
  destinations.map(function (dest) {
    bus.read({
      erd: erd,
      source: source,
      destination: dest
    })
  })
}

var getTempByCode = (function () {
  var codes = {
    21: 'hot',
    20: 'warm',
    19: 'colors',
    18: 'cool',
    17: 'cold',
    16: 'tap cold'
  }

  return function (code) {
    return codes[code]
  }
})()

var getCycleByCode = (function () {
  var codes = {
    1: 'basket_clean',
    2: 'rinse_and_spin',
    3: 'quick_rinse',
    4: 'bulky_items',
    5: 'sanitize',
    6: 'towels_and_sheets',
    7: 'steam_refresh',
    8: 'normal',
    9: 'whites',
    10: 'darks',
    11: 'jeans',
    12: 'hand_wash',
    13: 'delicates',
    14: 'speed_wash',
    15: 'heavy_duty',
    16: 'allergen',
    17: 'power_clean',
    18: 'rinse_and_spin',
    19: 'single_item',
    20: 'colors',
    21: 'cold_wash',
    128: 'cottons',
    129: 'easy_care',
    130: 'active_wear',
    131: 'time_dry',
    132: 'dewrinkle',
    133: 'air_fluff',
    134: 'steam_refresh',
    135: 'steam_dewrinkle',
    136: 'speed_dry',
    137: 'mixed',
    138: 'speed_dry',
    139: 'casuals',
    140: 'warm_up',
    141: 'energy_saver'
  }

  return function (code) {
    return codes[code]
  }
})()

var getReadableCycleName = function (code) {
  return getCycleByCode(code)
         .replace(/[_-]/g, ' ')
}

var playCycle = (function () {
  return function (code) {
    player.play('./voices/en/' + getCycleByCode(code) + '.mp3')
  }
})()
