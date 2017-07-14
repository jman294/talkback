const erds = require('./erds')

const messages = (function () {
  const en = {
    [erds.WATER_TEMP]: 'water temp: %1',
    [erds.SPIN_LEVEL]: 'spin level: %1',
    [erds.SOIL_LEVEL]: 'soil level: %1',
    [erds.MACHINE_STATUS]: 'Starting %1, with an estimated %2 minutes left.',
    [erds.DRY_TEMP]: 'dry temp: %1',
    [erds.STAIN_PRETREAT]: 'stain pretreat: %1',
    [erds.DEEP_FILL]: 'deep fill: %1',
    timeLeft: 'About %1 minutes left on the %2.'
  }

  const es = {
    [erds.WATER_TEMP]: 'temp del agua: %1',
    [erds.SPIN_LEVEL]: 'nivel de giro: %1',
    [erds.SOIL_LEVEL]: 'nivel del suelo: %1',
    [erds.MACHINE_STATUS]: 'Comenzando %1, con una estimacion %2 minutos restante.',
    [erds.DRY_TEMP]: 'temp seca: %1',
    [erds.STAIN_PRETREAT]: 'mancha pretratamiento: %1',
    [erds.DEEP_FILL]: 'relleno profundo: %1',
    timeLeft: 'About %1 minutes left on the %2.'
  }

  return {
    en,
    es
  }
})()

module.exports = messages
