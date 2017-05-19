var loudness = require('loudness')
var gea = require('gea-sdk')
var adapter = require('gea-adapter-usb')
var say = require('say')
var player = require('play-sound')({})
var gpio = require('rpi-gpio')
var fs = require('fs')

var app = gea.configure({
  address: 0xcb,
  version: [ 0, 0, 1, 0 ]
})

// Path for Raspberry PI GPIO
var GPIO_PATH = '/sys/class/gpio'

// Washer and Dryer constants
var SOURCE = 0xcb

var WASHER = 0x23
var DRYER = 0x2b

// ERD address constants
var TIME_SECS = 0x2007
var TIME_MINS = 0x0046
var CYCLE_SELECTED = 0x200A
var END_CYCLE = 0x2002
var WATER_TEMP = 0x2016
var SPIN_LEVEL = 0x2017
var SOIL_LEVEL = 0x2015
var MACHINE_STATUS = 0x2000
var DRY_TEMPERATURE_LEVEL = 0x2019
var STAIN_PRETREAT = 0xF107

// States for each of the machines
var states = [
  {
    id: WASHER,
    pinNo: 4,
    oldCycle: 0,
    cycleRunAlert: false,
    oldMinutesRemaining: 0,
    buttonPressed: false,
    // knobTurned has variable for water temperature, spin level, and soil level
    knobTurned: [false, false, false],
    inACycle: false,
    name: 'washer'
  },
  {
    id: DRYER,
    pinNo: 17,
    oldCycle: 0,
    cycleRunAlert: false,
    oldMinutesRemaining: 0,
    buttonPressed: false,
    // knobTurned has variables for temperature, dryness level, and time
    knobTurned: [false, false, false],
    inACycle: false,
    name: 'dryer'
  }
]

// Polling GPIO for cycle time left buttons
setInterval(readButtonStates, 100)


function readButtonStates () {
  states.map(function (state) {
    fs.readFile(GPIO_PATH + '/gpio' + state.pinNo + '/value', function (err, data) {
      if (err) throw err
      if (data == 0) {
        if (!state.buttonPressed && state.inACycle) {
          say.speak('About '.concat(state.oldMinutesRemaining).concat(' minutes left on the ').concat(state.name), 'voice_us2_mbrola')
        }
        state.buttonPressed = true
      } else {
        state.buttonPressed = false
      }
    })
  })
}

// Volume encoder wheel map
var encodings = {
   "0101": 1,
   "0100": 2,
   "0000": 3,
   "0001": 4,
   "0011": 5,
   "0010": 6,
   "0110": 7,
   "0111": 8,
   "1111": 9,
   "1110": 10,
   "1010": 11,
   "1011": 12,
   "1001": 13,
   "1000": 14,
   "1100": 15,
   "1101": 16
}

// Polling GPIO for volume encoder wheel
setInterval(function () {
  var regex = /\n$/
  var pin1 = fs.readFileSync(GPIO_PATH + '/gpio26/value').toString().replace(regex, '')
  var pin2 = fs.readFileSync(GPIO_PATH + '/gpio13/value').toString().replace(regex, '')
  var pin3 = fs.readFileSync(GPIO_PATH + '/gpio6/value').toString().replace(regex, '')
  var pin4 = fs.readFileSync(GPIO_PATH + '/gpio27/value').toString().replace(regex, '')
  var num = pin1.concat(pin2).concat(pin3).concat(pin4)
  loudness.setVolume(90-encodings[num], function (err) {
     if (err) throw err
  })
}, 100)

// Create bus to appliances
app.bind(adapter, function (bus) {
  // Listen for subscribes
  let timeSinceLastSubscribe = 0
  bus.on('publish', function (erd) {
    // A switch for each ERD coming on the subscribe event
    switch (erd.erd) {
      case MACHINE_STATUS:
        var machineStatus = erd.data[0]
        // For each appliance's, check if it is in a cycle
        for (var state in states) {
          if (erd.source === states[state].id) {
            if (machineStatus === 2) {
              states[state].inACycle = true
              if (states[state].cycleRunAlert) {
                // Pressed Start Button
                states[state].cycleRunAlert = false
                say.speak(
                    'Starting '
                    .concat(getReadableCycleName(states[state].oldCycle))
                    .concat(', with an estimated ')
                    .concat(states[state].oldMinutesRemaining)
                    .concat(' minutes left.')
                , 'voice_us2_mbrola')
              }
            } else {
              states[state].inACycle = false
              states[state].cycleRunAlert = true
            }
          }
        }
        break

      case DRY_TEMPERATURE_LEVEL:
        // Smelly
        setTimeout(function () {
           var level = erd.data[0]
           for (var state in states) {
              if (erd.source === states[state].id) {
                if (!states[state].knobTurned[0]) {
                  say.speak('Temperature ' + getTempLevelByCode(level))
                }
                states[state].knobTurned[0] = false
              }
           }
        }, 10)
        break

      case STAIN_PRETREAT:
        // Not used currently
        // Will only be returned by washer
        var stainType = erd.data[0]
        for (var state in states) {
          if (erd.source === states[state].id) {
            say.speak(stainType + '')
          }
        }
        break

      case SPIN_LEVEL:
        var tempCode = erd.data[0]
        // For each appliance's, say if the spin level has changed
        for (var state in states) {
          if (erd.source === states[state].id) {
            if (!states[state].knobTurned[0]) {
              say.speak('Spin level, '.concat(getSpinLevelByCode(tempCode)))
            }
            states[state].knobTurned[0] = false
          }
        }
        break

      case SOIL_LEVEL:
        var tempCode = erd.data[0]
        // For each appliance, say if the soil level has changed
        for (var state in states) {
          if (erd.source === states[state].id) {
            if (!states[state].knobTurned[1]) {
              say.speak('Soil level, '.concat(getSoilLevelByCode(tempCode)))
            }
            states[state].knobTurned[1] = false
          }
        }
        break

      case WATER_TEMP:
        var tempCode = erd.data[0]
        // For each appliance, say if the water temperature has changed
        for (var state in states) {
          if (erd.source === states[state].id) {
            if (!states[state].knobTurned[2]) {
              say.speak('Water temperature, '.concat(getTempByCode(tempCode)))
            }
            states[state].knobTurned[2] = false
          }
        }
        break

      case TIME_SECS:
        var bytes = erd.data
        // Time in seconds ERD (Returned by dryer only)
        for (var state in states) {
          if (erd.source === states[state].id) {
            var minutes = Math.round((bytes[0]*255 + bytes[1])/60)
            states[state].oldMinutesRemaining = minutes
          }
        }
        break

      case TIME_MINS:
        var timeRemaining = erd.data[1]
        // Time in minutes ERD (Returned by washer only)
        for (var state in states) {
          if (erd.source === states[state].id) {
            states[state].oldMinutesRemaining = timeRemaining
          }
        }
        break

      case CYCLE_SELECTED:
        var cycleSelected = erd.data[0]
        // Say if the cycle selected knob has changed
        for (var state in states) {
          if (erd.source === states[state].id) {
            for (let i in states[state].knobTurned) {
              states[state].knobTurned[i] = true
            }
            if (cycleSelected != states[state].oldCycle) {
              say.speak(getReadableCycleName(cycleSelected), 'voice_us2_mbrola')
            }
            states[state].oldCycle = cycleSelected
          }
        }
        break

      case END_CYCLE:
        // Not used currently
        var cycleEnd = erd.data[0]
        for (var state in states) {
          if (erd.source === states[state].id) {
          }
        }
        break
    }
  })

  // Subscribe to all above ERDs
  busSubscribe(bus, SOURCE, TIME_SECS, [DRYER])
  busSubscribe(bus, SOURCE, TIME_MINS, [WASHER])
  busSubscribe(bus, SOURCE, CYCLE_SELECTED, [WASHER, DRYER])
  busSubscribe(bus, SOURCE, WATER_TEMP, [WASHER])
  busSubscribe(bus, SOURCE, SOIL_LEVEL, [WASHER])
  busSubscribe(bus, SOURCE, SPIN_LEVEL, [WASHER])
  busSubscribe(bus, SOURCE, MACHINE_STATUS, [WASHER, DRYER])
  busSubscribe(bus, SOURCE, DRY_TEMPERATURE_LEVEL, [DRYER])
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

var getSoilLevelByCode = (function () {
  var codes = {
    0: 'extra light',
    1: 'light',
    2: 'normal',
    3: 'heavy',
    4: 'extra heavy'
  }

  return function (code) {
    return codes[code]
  }
})()

var getSpinLevelByCode = (function () {
  var codes = {
    0: 'no spin',
    1: 'unused',
    2: 'medium',
    3: 'high',
    4: 'extra high',
    5: 'disabled'
  }

  return function (code) {
    return codes[code]
  }
})()

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
    0: 'blank',
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

var getTempLevelByCode = (function () {
  var codes = {
     1: 'no heat',
     2: 'low heat',
     3: 'medium heat',
     4: 'high heat'
  }

  return function (code) {
     return codes[code]
  }
})()

var playCycle = (function () {
  return function (code) {
    player.play('./voices/en/' + getCycleByCode(code) + '.mp3')
  }
})()
