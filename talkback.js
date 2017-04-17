var gea = require("gea-sdk");
var adapter = require("gea-adapter-usb");

var talkback = (function () {

  var app = gea.configure({
      address: 0xcb,
      version: [ 0, 0, 1, 0 ]
  });

  var SOURCE = 0xcb
  var WASHER =  'washer'
  var DRYER = 'dryer'

  var app = gea.configure({
      address: 0xcb,
      version: [ 0, 0, 1, 0 ]
  });

  var destinations = [
    {
      address: 0x2b, 
      name: WASHER
    },
    {
      address: 0x23, 
      name: DRYER
    }
  ]

  function init () {
    return new Promise (function (resolve, reject) {
      app.bind(adapter, resolve)
    })
  }

  return { 
    init
  }
})()

module.exports = talkback
