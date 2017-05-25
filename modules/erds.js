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

  const erdList = {
    [TIME_SECS]: {
      causes: [],
      data: function (erd) {
        return (erd.data[0]*255 + erd.data[1])/60
      }
    },
    [TIME_MINS]: {
      causes: [],
      data: function (erd) {
        return erd.data[1]
      }
    },
    [CYCLE_SELECTED]: {
      causes: [WATER_TEMP, SOIL_LEVEL, SPIN_LEVEL, DRY_TEMP],
      data: function (erd) {
        return erd.data[0]
      }
    },
    [END_CYCLE]: {
      causes: [],
      data: function (erd) {
        return erd.data[0]
      }
    },
    [WATER_TEMP]: {
      causes: [TIME_MINS],
      data: function (erd) {
        return erd.data[0]
      }
    },
    [SPIN_LEVEL]: {
      causes: [TIME_MINS],
      data: function (erd) {
        return erd.data[0]
      }
    },
    [SOIL_LEVEL]: {
      causes: [TIME_MINS],
      data: function (erd) {
        return erd.data[0]
      }
    },
    [MACHINE_STATUS]: {
      causes: [],
      data: function (erd) {
        return erd.data[0]
      }
    },
    [DRY_TEMP]: {
      causes: [],
      data: function (erd) {
        return erd.data[0]
      }
    },
    [STAIN_PRETREAT]: {
      causes: [WATER_TEMP, SOIL_LEVEL, SPIN_LEVEL],
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
    MACHINE_STATUS
  }

})()

module.exports = erds
