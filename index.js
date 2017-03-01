var player = require('play-sound')()
var greenBean = require('green-bean')
var uname = require('node-uname')
var fs = require('fs')
var gotPi = false

var unameInfo = uname()
if (unameInfo.machine) {
  if (unameInfo.machine.indexOf('x86') === 0) {
  } else {
    gotPi = true
  }
} else {
  console.log('No machine info found.')
}

if (gotPi) {
  var gpio = require('rpi-gpio')

  gpio.on('change', function (channel, value) {
    // When the button is released
    if (value === false) {
      if (chime > Object.keys(chimes).length - 1) {
        chime = 1
      } else {
        chime++
      }
    }
  })
  gpio.setup(7, gpio.DIR_IN, gpio.EDGE_BOTH)
}

var chime = 1
var chimes = {
  1: 'chime',
  2: 'chime_big_ben',
  3: 'chime_x'
}

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
  141: 'energy-saver'
}

// All supported languages
var languages = {
  1: 'en',
  2: 'cn',
  3: 'es'
}
// Current language
var language = languages[1]

const INTERVAL = 60000
const CHECK_INTERVAL = 15000
const INTERVAL_COUNTER = INTERVAL/CHECK_INTERVAL

greenBean.connect('laundry', function (laundry) {
  console.log('Connected to some laundries')

  var requestCycleSelectedStatus = (function (callback) {
    var oldSelection = -10
    return function () {
      laundry.cycleSelected.read(function (value) {
        // Value parameter is the code returned by the washer describing the cycle selected
        if (value === 0 || codes[value] === undefined) {
          console.error('Selection is Undefined or unknown: ' + value)
        } else {
          console.log('New selection : ' + value + ', which is ' + codes[value])
          if (value === oldSelection) {
            console.log('The selection did not change.')
            return
          }
          oldSelection = value
          console.log('Playing a sound for the new selection.')
          playSound(getCycleCodeSoundPath(value))
        }
      })
    }
  })()

  var requestMachineStatus = (function () {
    var beepCount = 0
    var isEndOfCycle = false
    return function (laundry, intervalCounter) {
      console.log('beepCount: '+beepCount, ' isEndOfCycle: '+isEndOfCycle, + ' ' + intervalCounter)
      laundry.machineStatus.read(function (machineStatus) {
        // 4: End of cycle
        if (machineStatus === 4) {
          isEndOfCycle = true
        } else {
          // 0: Off (We still want isEndOfCycle to be true when it is off)
          if (machineStatus !== 0) {
            beepCount = 0
            isEndOfCycle = false
          }
        }
        if (isEndOfCycle) {
          beepCount++
          if (beepCount % intervalCounter === 0) {
            beepCount = 0
            console.log('playing buzzer')
            playSound('./buzzers/' + chimes[chime] + '.wav')
          }
        }
      })
    }
  })()

  setInterval(function () {
    console.log('Requesting cycle status.')
    requestCycleSelectedStatus()
  }, 1000)

  setInterval(function() {
    requestMachineStatus(laundry, INTERVAL_COUNTER)
  } , CHECK_INTERVAL)
})

function getCycleCodeSoundPath (code) {
  return './voices/' + language + '/' + codes[code] + '.mp3'
}

function playSound (path) {
  if (fs.existsSync(path)) {
    player.play(path)
  } else {
    console.error('Sound file does not exist: ' + path)
  }
}
