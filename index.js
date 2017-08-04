const version = 2.0
console.log('talkback version ' + version)

const loudness = require('loudness')
const talkback = require('./modules/talkback')
const fs = require('fs')
const say = require('say')
const tts = require('./modules/tts')
const erds = require('./modules/erds')
const enums = require('./modules/enumerations')
const messages = require('./modules/messages')
talkback.start()

// Only works on Raspberry Pi
fs.readFile('/proc/cpuinfo', function(err, data) {
  if (data.toString().indexOf('BCM2709') !== -1 || data.toString().indexOf('BCM2708') !== -1) {
    const GPIO_PATH = '/sys/class/gpio'
    setInterval(function() {
      talkback.appliances.map(function(appliance) {
        fs.readFile(GPIO_PATH + '/gpio' + appliance.pinNo + '/value', function(err, data) {
          if (err) throw err
          if (data == 0) {
            if (!appliance.buttonPressed) {
              if (appliance.name === 'dryer') {
                if (appliance.inACycle) {
                  let message = messages[talkback.lang].dryerRunStatus
                  tts.speak(message.replace('%1',  enums[talkback.lang].cycle[appliance.oldCycle]).replace('%2', appliance.timeInMins))
                } else {
                  let message = messages[talkback.lang].dryerStatus
                  tts.speak(message.replace('%1', appliance.machineStatus).replace('%2', enums[talkback.lang].cycle[appliance.oldCycle]))
                }
              } else if (appliance.name === 'washer') {
                if (appliance.inACycle) {
                  let message = messages[talkback.lang].washerRunStatus
                  tts.speak(message.replace('%1',  enums[talkback.lang].cycle[appliance.oldCycle]).replace('%2', appliance.timeInMins))
                } else {
                  let message = messages[talkback.lang].washerStatus
                  tts.speak(message.replace('%1', appliance.machineStatus).replace('%2', enums[talkback.lang].cycle[appliance.oldCycle]))
                }
                //let spinLevelMessage = messages[talkback.lang][erds.SPIN_LEVEL].replace('%1', appliance.spinLevel)
                //let soilLevelMessage = messages[talkback.lang][erds.SOIL_LEVEL].replace('%1', appliance.soilLevel)
                //let waterTempMessage = messages[talkback.lang][erds.WATER_TEMP].replace('%1', appliance.waterTemp)
                //tts.speak(spinLevelMessage + ' , ' + soilLevelMessage + ' , ' + waterTempMessage + ' , ' + messages[talkback.lang]["timeLeft"].replace('%1', appliance.timeInMins).replace('%2', appliance.name), talkback.lang)
              }
            }
            appliance.buttonPressed = true
          } else {
            appliance.buttonPressed = false
          }
        })
      })
    })

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

    // Read Volume Encoder
    setInterval(function() {
      var regex = /\n$/
      var pin1 = fs.readFileSync(GPIO_PATH + '/gpio26/value').toString().replace(regex, '')
      var pin2 = fs.readFileSync(GPIO_PATH + '/gpio13/value').toString().replace(regex, '')
      var pin3 = fs.readFileSync(GPIO_PATH + '/gpio6/value').toString().replace(regex, '')
      var pin4 = fs.readFileSync(GPIO_PATH + '/gpio27/value').toString().replace(regex, '')
      var num = pin1.concat(pin2).concat(pin3).concat(pin4)
      loudness.setVolume(90 - encodings[num], function(err) {
        if (err) throw err
      })
    }, 100)
    setInterval(function() {
      var pin = fs.readFileSync(GPIO_PATH + '/gpio22/value').toString().replace(/\n$/, '')
      var langs = ['en', 'es']
      //talkback.lang = langs[(langs.indexOf(talkback.lang) + 1) % langs.length]
    }, 100)
  }

})
