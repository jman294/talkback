const eventbuffer = require('./eventbuffer')
const appliance = function () {

  let buffer = eventbuffer()

  return {
    buffer
  }
}

module.exports = appliance
