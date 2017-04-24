var gea = require("gea-sdk");
var adapter = require("gea-adapter-usb");
var say = require('say')

var app = gea.configure({
  address: 0xcb,
  version: [ 0, 0, 1, 0 ]
});

var SOURCE = 0xcb

var WASHER =  0x2b
var DRYER = 0x23

var TIME_SECS = 0x2007
var TIME_MINS = 0x0046
var CYCLE_SELECTED = 0x200A

app.bind(adapter, function (bus) {
  bus.on("read-response", function(erd) {
    switch (erd.erd) {
      case TIME_SECS:
        console.log('time in seconds', erd.data)
        break

      case TIME_MINS:
        console.log('time in mins', erd.data)
        break

      case CYCLE_SELECTED:
        console.log(erd.data)
        break
    }
  });
  setInterval(function() {
    busRead(bus, SOURCE, TIME_SECS, [WASHER])
    busRead(bus, SOURCE, TIME_MINS, [DRYER])
    busRead(bus, SOURCE, CYCLE_SELECTED, [WASHER, DRYER])
    //bus.read({
      //erd: TIME_SECS,
      //source: SOURCE,
      //destination: WASHER
    //});
    //bus.read({
      //erd: TIME_MINS,
      //source: SOURCE,
      //destination: DRYER
    //});
    //bus.read({
      //erd: CYCLE_SELECTED,
      //source: SOURCE,
      //destination: DRYER
    //});
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
