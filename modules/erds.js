const erds = (function () {

  const TIME_SECS = 0x2007
  const TIME_MINS = 0x0046
  const CYCLE_SELECTED = 0x200A
  const END_CYCLE = 0x2002
  const WATER_TEMP = 0x2016
  const SPIN_LEVEL = 0x2017
  const SOIL_LEVEL = 0x2015
  const MACHINE_STATUS = 0x2000
  const DRY_TEMP = 0x2019
  const STAIN_PRETREAT = 0xF107
  const DEEP_FILL = 0xF123
  const CYCLE_HISTORY = 0xE009

  const erdList = {
    [TIME_SECS]: {
      causes: [],
      alwaysRun: true,
      data: function (erd) {
        return (erd.data[0]*255 + erd.data[1])/60
      }
    },
    [TIME_MINS]: {
      causes: [],
      alwaysRun: true,
      data: function (erd) {
        return erd.data[1]
      }
    },
    [CYCLE_SELECTED]: {
      causes: [WATER_TEMP, SOIL_LEVEL, SPIN_LEVEL, DRY_TEMP, STAIN_PRETREAT, DEEP_FILL],
      alwaysRun: true,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [END_CYCLE]: {
      causes: [],
      alwaysRun: true,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [WATER_TEMP]: {
      causes: [],
      alwaysRun: false,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [SPIN_LEVEL]: {
      causes: [],
      alwaysRun: false,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [SOIL_LEVEL]: {
      causes: [],
      alwaysRun: false,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [MACHINE_STATUS]: {
      causes: [],
      alwaysRun: false,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [DRY_TEMP]: {
      causes: [],
      alwaysRun: false,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [STAIN_PRETREAT]: {
      causes: [WATER_TEMP, SOIL_LEVEL, SPIN_LEVEL],
      alwaysRun: false,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [DEEP_FILL]: {
      causes: [],
      alwaysRun: false,
      data: function (erd) {
        return erd.data[0]
      }
    }
  }

  function erd (id) {
    let erd = erdList[id]
    if (erd === undefined) {
      throw new Error('ID not valid erd')
    }
    return erd
  }

  return {
    erd,
    TIME_SECS,
    TIME_MINS,
    CYCLE_SELECTED,
    END_CYCLE,
    WATER_TEMP,
    SPIN_LEVEL,
    SOIL_LEVEL,
    MACHINE_STATUS,
    STAIN_PRETREAT,
    DRY_TEMP,
    DEEP_FILL,
    CYCLE_HISTORY
  }

})()

module.exports = erds
