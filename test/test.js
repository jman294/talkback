var gea = require("gea-sdk");
var adapter = require("gea-adapter-usb");
var say = require('say')
var player = require('play-sound')({})

var app = gea.configure({
  address: 0xcb,
  version: [ 0, 0, 1, 0 ]
});

//player.play('./voices/en/
var SOURCE = 0xcb

var WASHER =  0x23
var DRYER = 0x2b

var TIME_SECS = 0x2007
var TIME_MINS = 0x0046
var CYCLE_SELECTED = 0x200A

var states = [
{
  id: WASHER,
  oldCycle: 0,
  name: 'washer'
},
{
  id: DRYER,
  oldCycle: 0,
  name: 'dryer'
}
]

app.bind(adapter, function (bus) {
  bus.on("read-response", function(erd) {
    switch (erd.erd) {
      case TIME_SECS:
        //console.log('time in seconds', erd.data)
        break

      case TIME_MINS:
        //console.log('time in mins', erd.data)
        break

      case CYCLE_SELECTED:
        var cycleSelected = erd.data[0]
        for (var state in states) {
          if (erd.source === states[state].id ) {
            if (cycleSelected !== states[state].oldCycle) {
              console.log('new', states[state].name, 'cycle:', cycleSelected)
              playCycle(cycleSelected)
            } else {
              //console.log('same cycle')
            }
            states[state].oldCycle = cycleSelected
          }
        }
        break
    }
  });
  setInterval(function() {
    //busRead(bus, SOURCE, TIME_SECS, [WASHER])
    //busRead(bus, SOURCE, TIME_MINS, [DRYER])
    //busRead(bus, SOURCE, CYCLE_SELECTED, [WASHER, DRYER])
    bus.read({
      erd: CYCLE_SELECTED,
      source: SOURCE,
      destination: WASHER
    });
    bus.read({
      erd: CYCLE_SELECTED,
      source: SOURCE,
      destination: DRYER
    });
  }, 1000);
});

function busRead (bus, source, erd, destinations) {
  destinations.map(function (dest) {
    bus.read({
      erd: erd,
      source: source,
      destination: dest
    })
  })
}

var playCycle = (function () {
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
  
  return function (value) {
    player.play('./voices/en/'+codes[value]+'.mp3')
  }
})()
