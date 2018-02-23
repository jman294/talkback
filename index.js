const version = 2.0
console.log('talkback version ' + version)

const loudness = require('loudness')
const talkback = require('./modules/talkback')
const fs = require('fs')
const os = require('os')
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
                  tts.speak(message.replace('%1',  enums[talkback.lang].cycle[appliance.oldCycle]).replace('%2', appliance.timeInMins), talkback.lang)
                } else if (appliance.machineStatus === 'idle') {
                  tts.speak(messages[talkback.lang].off.replace('%1', appliance.name), talkback.lang)
                } else {
                  let message = messages[talkback.lang].dryerStatus
                  tts.speak(message.replace('%1', appliance.machineStatus)
                                   .replace('%2', enums[talkback.lang].cycle[appliance.oldCycle])
                                   .replace('%3', appliance.dryTemp), talkback.lang)
                }
              } else if (appliance.name === 'washer') {
                if (appliance.inACycle) {
                  let message = messages[talkback.lang].washerRunStatus
                  tts.speak(message.replace('%1',  enums[talkback.lang].cycle[appliance.oldCycle]).replace('%2', appliance.timeInMins), talkback.lang)
                } else if (appliance.machineStatus === 'idle') {
                  tts.speak(messages[talkback.lang].off.replace('%1', appliance.name), talkback.lang)
                } else {
                  let message = messages[talkback.lang].washerStatus
                  tts.speak(message.replace('%1', appliance.machineStatus)
                                   .replace('%2', enums[talkback.lang].cycle[appliance.oldCycle])
                                   .replace('%3', appliance.soilLevel)
                                   .replace('%4', appliance.spinLevel)
                                   .replace('%5', appliance.waterTemp), talkback.lang)
                }
              }
            }
            appliance.buttonPressed = true
          } else {
            appliance.buttonPressed = false
          }
        })
      })
    })

    var filename = os.homedir() + '/.talkbackvolume'
    var volumeLevels = [25, 40, 55, 56, 100]
    var volumeLevel = 3
    if (fs.existsSync(filename)) {
      try {
        volumeLevel = parseInt(fs.readFileSync(filename))
      } catch (e) {
        // keep volume level at 3
      }
    } else {
      fs.writeFileSync(ilename, volumeLevel, (err) => {
        if (err) throw err
      })
    }
    var buttonPressed = true

    setInterval(function() {
      var up = parseInt(fs.readFileSync(GPIO_PATH + '/gpio6/value'))
      var down = parseInt(fs.readFileSync(GPIO_PATH + '/gpio13/value'))
      if (down === 0 && !buttonPressed) {
        buttonPressed = true
        if (volumeLevel < volumeLevels.length) {
          volumeLevel -= 1
        }
        tts.speak('Volume level ' + (volumeLevel+1), talkback.lang)
      } else if (up === 0 && !buttonPressed) {
        buttonPressed = true
        if (volumeLevel < volumeLevels.length) {
          volumeLevel += 1
        }
        tts.speak('Volume level ' + (volumeLevel+1), talkback.lang)
      }
      if (up === 0 || down === 0) {
        fs.writeFile(filename, volumeLevel, (err) => {
          if (err) throw err
        })
      }
      loudness.setVolume(volumeLevels[volumeLevel], function(err) {
        if (err) throw err
      })
    }, 100)

    // Language
    setInterval(function() {
      var pin = fs.readFileSync(GPIO_PATH + '/gpio22/value').toString().replace(/\n$/, '')
      var langs = ['en', 'es']
      //talkback.lang = langs[(langs.indexOf(talkback.lang) + 1) % langs.length]
    }, 100)
  }

})
