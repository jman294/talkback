const erds = require('./erds')

const messages = (function () {
  const en = {
    [erds.WATER_TEMP]: 'water temp: %1',
    [erds.SPIN_LEVEL]: 'spin level: %1',
    [erds.SOIL_LEVEL]: 'soil level: %1',
    [erds.MACHINE_STATUS]: 'Starting %1, with an estimated %2 minutes left.',
    [erds.DRY_TEMP]: 'dry temp: %1',
    [erds.STAIN_PRETREAT]: 'stain pretreat: %1',
    [erds.LOAD_SIZE]: 'load size: %1',
    [erds.DEEP_FILL]: 'deep fill: %1',
    [erds.EXTRA_RINSE]: 'extra rinse: %1',
    [erds.DEEP_RINSE]: 'deep rinse: %1',
    [erds.DELAY_WASH]: 'delay wash: %1',
    [erds.WARM_RINSE]: 'warm rinse: %1',
    [erds.SOAK]: 'soak: %1',
    [erds.VOLUME]: 'volume: %1',
    [erds.STAIN]: 'stain: %1',
    timeLeft: 'About %1 minutes left on the %2.',
    off: '%1 off',
    washerRunStatus: 'Washer currently running %1 with about %2 minutes left',
    washerStatus: 'Washer currently %1 with %2 selected and soil level %3, spin level %4, and water temp %5',
    dryerRunStatus: 'Dryer currently running %1 with about %2 minutes left',
    dryerStatus: 'Dryer currently %1 with %2 selected and dry temp %3'
  }

  const es = {
    [erds.WATER_TEMP]: 'water temp: %1',
    [erds.SPIN_LEVEL]: 'spin level: %1',
    [erds.SOIL_LEVEL]: 'soil level: %1',
    [erds.MACHINE_STATUS]: 'Starting %1, with an estimated %2 minutes left.',
    [erds.DRY_TEMP]: 'dry temp: %1',
    [erds.STAIN_PRETREAT]: 'stain pretreat: %1',
    [erds.LOAD_SIZE]: 'load size: %1',
    [erds.DEEP_FILL]: 'deep fill: %1',
    [erds.EXTRA_RINSE]: 'extra rinse: %1',
    [erds.DEEP_RINSE]: 'deep rinse: %1',
    [erds.DELAY_WASH]: 'delay wash: %1',
    [erds.WARM_RINSE]: 'warm rinse: %1',
    [erds.SOAK]: 'soak: %1',
    [erds.VOLUME]: 'volume: %1',
    [erds.STAIN]: 'stain: %1',
    timeLeft: 'About %1 minutes left on the %2.',
    off: '%1 off',
    washerRunStatus: 'Washer currently running %1 with about %2 minutes left',
    washerStatus: 'Washer currently %1 with %2 selected and soil level %3, spin level %4, and water temp %5',
    dryerRunStatus: 'Dryer currently running %1 with about %2 minutes left',
    dryerStatus: 'Dryer currently %1 with %2 selected and dry temp %3'
  }

  return {
    en,
    es
  }
})()

module.exports = messages
