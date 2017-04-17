/*
 * This application will show detailed information about an appliance.
 *
 * Copyright (c) 2014 General Electric
 *  
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 * 
 */

var gea = require("gea-sdk");
var adapter = require("gea-adapter-usb");
var say = require('say')
var talkback = require('../talkback')

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
console.log(talkback)

//app.bind(adapter, function (bus) {
talkback.init().then(function (bus) {
  bus.on("read-response", function(erd) {
    for (var dest in destinations) {
      if (erd.source === destinations[dest].address) {
        console.log('The '+destinations[dest].name+' returned '+erd.data[1])
      }
    }
  });
  setInterval(function() {
    bus.read({
      erd: 0x2007,
      source: 0xcb,
      destination: destinations[0].address
    });
    bus.read({
      erd: 0x0046,
      source: 0xcb,
      destination: destinations[1].address
    });
  }, 2000);
});

