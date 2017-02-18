var Player = require('play-sound')(opts = {})
var greenBean = require('green-bean');
var uname = require('node-uname');
var gotPi = false;
var fs = require('fs');

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
         index++;
         if (index > Object.keys(languages).length) {
            index = 1;
         }
         language = languages[index];
         console.log(language);
         // TODO: When language changes, play an mp3 file with new language
      }
   });
   gpio.setup(7, gpio.DIR_IN, gpio.EDGE_BOTH);
}

var index = 1;
// All supported languages
var languages = {
	1:'en',
	2:'cn',
	3:'es'
}
// Current language
var language = languages[1];
// All cycleSelected values that can be returned from washer or dryer
var codes = {
	1:'Basket Clean',
	2:'Rinse and Spin',
	3:'Quick Rinse',
	4:'Bulky Items',
	5:'Sanitize',
	6:'Towels and Sheets',
	7:'Steam refresh',
	8:'Normal',
	9:'Whites',
	10:'Darks',
	11:'Jeans',
	12:'Hand Wash',
	13:'Delicates',
	14:'Speed Wash',
	15:'Heavy duty',
	16:'Allergen',
	17:'Power Clean',
	18:'Rinse and Spin',
	19:'Single Item',
	128:'Cottons',
	129:'Easy Care',
	130:'Active Wear',
	131:'Time Dry',
	132:'Dewrinkle',
	133:'Quick Air Fluff',
	134:'Steam refresh',
	135:'Steam Dewrinkle',
	136:'Speed Dry',
	137:'Mixed',
	138:'Speed Dry',
	139:'Casuals',
	140:'Warm Up'
}

console.log('test')
greenBean.connect('laundry', function(laundry) {
console.log('Connected to some laundries')

loops.while(
     () => true,
     () => {
       return new Promise((resolve, reject) => {
         setTimeout(() => {
           laundry.endOfCycle.read(function (endOfCycle) {
             if(endOfCycle) {
               console.log('end of cycle')
               reject(loops.break);
             } else {
               console.log('not end of cycle')
               resolve();
             }
           }, 1000);
         });
       });
     }
   )
   .then(() => {
     loops.while(
       () => true,
       () => {
         return new Promise((resolve, reject) => {
           setTimeout(() => {
             playBuzzer(),
             60000);
           });
         });
       }
     )
   });
 })

 function playbuzzer() {
   player.play('buzzers/chim_60.wav')
 }

 module.exports = {}
