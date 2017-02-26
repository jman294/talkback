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
  1: 'Basket Clean',
  2: 'Rinse and Spin',
  3: 'Quick Rinse',
  4: 'Bulky Items',
  5: 'Sanitize',
  6: 'Towels and Sheets',
  7: 'Steam refresh',
  8: 'Normal',
  9: 'Whites',
  10: 'Darks',
  11: 'Jeans',
  12: 'Hand Wash',
  13: 'Delicates',
  14: 'Speed Wash',
  15: 'Heavy duty',
  16: 'Allergen',
  17: 'Power Clean',
  18: 'Rinse and Spin',
  19: 'Single Item',
  128: 'Cottons',
  129: 'Easy Care',
  130: 'Active Wear',
  131: 'Time Dry',
  132: 'Dewrinkle',
  133: 'Quick Air Fluff',
  134: 'Steam refresh',
  135: 'Steam Dewrinkle',
  136: 'Speed Dry',
  137: 'Mixed',
  138: 'Speed Dry',
  139: 'Casuals',
  140: 'Warm Up'
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
