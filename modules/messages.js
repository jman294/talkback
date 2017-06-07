const erds = require('./erds')

const messages = (function () {
  const en = {
    [erds.WATER_TEMP]: 'water temp: %1',
    [erds.SPIN_LEVEL]: 'spin level: %1',
    [erds.SOIL_LEVEL]: 'soil level: %1',
    [erds.MACHINE_STATUS]: 'Starting %1, with an estimated %2 minutes left.',
    [erds.DRY_TEMP]: 'dry temp: %1',
    [erds.STAIN_PRETREAT]: 'stain pretreat: %1',
    [erds.DEEP_FILL]: 'deep fill: %1'
  }

  return {
    en
  }
})()

module.exports = messages
