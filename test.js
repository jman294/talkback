var gea = require("gea-sdk");
var adapter = require("gea-adapter-usb");
var say = require('say')
var gpio = require('rpi-gpio')

var app = gea.configure({
    address: 0xcb,
    version: [ 0, 0, 1, 0 ]
});

app.bind(adapter, function (bus) {
  gpio.on('change', function (channel, value) {
      bus.read({
      erd: 0x0046,
      source: 0xcb,
      destination: 0x23
    });
    bus.on("read-response", function(erd) {
      console.log("----------> We received a response from the washer.");
      console.log("ERD: 0x" + erd.erd.toString(16));
      console.log("data: " + erd.data)
      console.log("dest: 0x" + erd.destination.toString(16));
      console.log("src : 0x" + erd.source.toString(16));
    });
  })
  gpio.setup(7, gpio.DIR_IN, gpio.EDGE_BOTH)
});
