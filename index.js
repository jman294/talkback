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

var PATH = '/sys/class/gpio'

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
    pinNo: 4,
    oldCycle: 0,
    cycleRunAlert: false,
    oldMinutesRemaining: 0,
    buttonPressed: false,
    name: 'washer'
  },
  {
    id: DRYER,
    pinNo: 17,
    oldCycle: 0,
    cycleRunAlert: false,
    oldMinutesRemaining: 0,
    buttonPressed: false,
    name: 'dryer'
  }
]

setInterval(function () {
  states.map(function (state) {
    fs.readFile(PATH + '/gpio' + state.pinNo + '/value', function (err, data) {
      if (err) throw err
      if (data == 0) {
        if (!state.buttonPressed) {
          say.speak('About '.concat(state.oldMinutesRemaining).concat(' minutes left on the ').concat(state.name), 'voice_us2_mbrola')
        }
        state.buttonPressed = true
      } else {
        state.buttonPressed = false
      }
    })
  })
}, 100)

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

setInterval(function () {
  var regex = /\n$/
  var pin1 = fs.readFileSync(PATH + '/gpio26/value').toString().replace(regex, '')
  var pin2 = fs.readFileSync(PATH + '/gpio13/value').toString().replace(regex, '')
  var pin3 = fs.readFileSync(PATH + '/gpio6/value').toString().replace(regex, '')
  var pin4 = fs.readFileSync(PATH + '/gpio27/value').toString().replace(regex, '')
  var num = pin1.concat(pin2).concat(pin3).concat(pin4)
  console.log(num, encodings[num])
  loudness.setVolume(90-encodings[num], function (err) {
     if (err) throw err
  })
}, 100)

app.bind(adapter, function (bus) {
  bus.on('publish', function (erd) {
    switch (erd.erd) {
      case MACHINE_STATUS:
        var machineStatus = erd.data[0]
        for (var state in states) {
          if (erd.source === states[state].id) {
            if (machineStatus === 2) {
              if (states[state].cycleRunAlert) {
                // Pressed Start Button
                states[state].cycleRunAlert = false
                say.speak(
                    'Starting '
                    .concat(getReadableCycleName(states[state].oldCycle))
                    .concat(', with an estimated ')
                    .concat(states[state].oldMinutesRemaining)
                    .concat(' minutes remaining.')
                , 'voice_us2_mbrola')
              }
            } else {
              states[state].cycleRunAlert = true
            }
          }
        }
        break

      //case WATER_TEMP:
        //var tempCode = erd.data[0]
        //for (var state in states) {
          //if (erd.source === states[state].id) {
            //if (!states[state].knobTurned) {
              //say.speak('Water temperature, '.concat(getTempByCode(tempCode)))
            //}
            //states[state].knobTurned = false
          //}
        //}
        //console.log(tempCode)
        //say.speak('Water temperature, '.concat(getTempByCode(tempCode)))
        //break

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
          }
        }
        break

      case CYCLE_SELECTED:
        var cycleSelected = erd.data[0]
        for (var state in states) {
          if (erd.source === states[state].id) {
            if (cycleSelected !== states[state].oldCycle) {
              say.speak(getReadableCycleName(cycleSelected), 'voice_us2_mbrola')
            }
            states[state].oldCycle = cycleSelected
          }
        }
        break

      case END_CYCLE:
        var cycleEnd = erd.data[0]
        for (var state in states) {
          if (erd.source === states[state].id) {
          }
        }
        break
    }
  })
  busSubscribe(bus, SOURCE, TIME_SECS, [DRYER])
  busSubscribe(bus, SOURCE, TIME_MINS, [WASHER])
  busSubscribe(bus, SOURCE, CYCLE_SELECTED, [WASHER, DRYER])
  //busSubscribe(bus, SOURCE, WATER_TEMP, [WASHER, DRYER])
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
