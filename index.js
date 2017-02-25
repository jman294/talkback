var player = require('play-sound')(opts = {})
var greenBean = require('green-bean');
var uname = require('node-uname');
var loops = require('async-loops')
var fs = require('fs');
var gotPi = false;

var unameInfo = uname();
console.log(unameInfo);
console.log("Type: " + typeof(unameInfo));
if (unameInfo.machine) {
   console.log("Machine: " + unameInfo.machine);
   if (unameInfo.machine.indexOf('x86') == 0) {
         console.log("This is not a pi so we can't update the board.");
      } else {
            console.log("This machine is not x86, so maybe we can update.");
            gotPi = true
         }
} else {
   console.log("No machine info found.");
}

if (gotPi) {
   var gpio = require('rpi-gpio');

   gpio.on('change', function(channel, value) {
      // When the button is released
      if (value == false) {
        if (chime > Object.keys(chimes).length-1) {
          chime = 1
        } else {
          chime++
        }
      }
     console.log('chime: '+chime)
   });
   gpio.setup(7, gpio.DIR_IN, gpio.EDGE_BOTH);
}

var chime = 1
var chimes = {
  1: 'chime',
  2: 'chime_big_ben',
  3: 'chime_x'
}

// All supported languages
var languages = {
	1:'en',
	2:'cn',
	3:'es'
}
// Current language
var language = languages[1];

console.log('test')
greenBean.connect('laundry', function(laundry) {
  console.log('Connected to some laundries')
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

 function playbuzzer() {
   player.play('buzzers/'+chimes[chime]+'.wav')
 }
