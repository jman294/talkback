var player = require('play-sound')()
var greenBean = require('green-bean')
var uname = require('node-uname')
var fs = require('fs')
var gotPi = false

var unameInfo = uname()
console.log(unameInfo)
console.log('Type: ' + typeof (unameInfo))
if (unameInfo.machine) {
  console.log('Machine: ' + unameInfo.machine)
  if (unameInfo.machine.indexOf('x86') === 0) {
    console.log("This is not a pi so we can't update the board.")
  } else {
    console.log('This machine is not x86, so maybe we can update.')
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
    console.log('chime: ' + chime)
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
  128: 'cottons',
  129: 'easy_care',
  130: 'active_wear',
  131: 'time_dry',
  132: 'dewrinkle',
  133: 'quick_air_fluff',
  134: 'steam_refresh',
  135: 'steam_dewrinkle',
  136: 'speed_dry',
  137: 'mixed',
  138: 'speed_dry',
  139: 'casuals',
  140: 'warm_up'
}

// All supported languages
var languages = {
  1: 'en',
  2: 'cn',
  3: 'es'
}
// Current language
var language = languages[1]

console.log('test')
greenBean.connect('laundry', function (laundry) {
  console.log('Connected to some laundries')
  var oldSelection = -10

  function requestCycleStatus (callback) {
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
        playCycleCode(value)
      }
    })
  }

  setInterval(function () {
    console.log('Requesting cycle status.')
    requestCycleStatus()
  }, 1000)

  setInterval(function () {
    laundry.endOfCycle.read(function (value) {
      if (value === 1) {
        console.log('end of cycle')
        playBuzzer()
      } else {
        console.log('not end of cycle')
      }
    })
  }, 60000)
})

function playBuzzer () {
  player.play('buzzers/' + chimes[chime] + '.wav')
}

function playCycleCode (code) {
  var soundFile = './voices/' + language + '/' + codes[code] + '.mp3'
  if (fs.existsSync(soundFile)) {
    player.play(soundFile)
  } else {
    console.log('Sound file does not exist: ' + soundFile)
  }
}
