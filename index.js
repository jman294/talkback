const loudness = require('loudness')
const talkback = require('./modules/talkback')
talkback.start()

// Only works on Raspberry Pi
if (false) {
setInterval(function () {
  talkback.appliances.map(function (appliance) {
    fs.readFile(PATH + '/gpio' + appliance.pinNo + '/value', function (err, data) {
      if (err) throw err
      if (data == 0) {
        if (!appliance.buttonPressed && appliance.inACycle) {
          say.speak('About '.concat(appliance.timeInMins).concat(' minutes left on the ').concat(appliance.name), 'voice_us2_mbrola')
        }
        appliance.buttonPressed = true
      } else {
        appliance.buttonPressed = false
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

// Read Volume Encoder
setInterval(function () {
  var regex = /\n$/
  var pin1 = fs.readFileSync(PATH + '/gpio26/value').toString().replace(regex, '')
  var pin2 = fs.readFileSync(PATH + '/gpio13/value').toString().replace(regex, '')
  var pin3 = fs.readFileSync(PATH + '/gpio6/value').toString().replace(regex, '')
  var pin4 = fs.readFileSync(PATH + '/gpio27/value').toString().replace(regex, '')
  var num = pin1.concat(pin2).concat(pin3).concat(pin4)
  loudness.setVolume(90-encodings[num], function (err) {
     if (err) throw err
  })
}, 100)
}
