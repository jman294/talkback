const erds = (function () {

  const TIME_SECS = 0x2007
  const TIME_MINS = 0x0046
  const CYCLE_SELECTED = 0x200A
  const END_CYCLE = 0x2002
  const WATER_TEMP = 0x2016
  const SPIN_LEVEL = 0x2017
  const SOIL_LEVEL = 0x2015
  const MACHINE_STATUS = 0x2000

  const erdList = {
    [TIME_SECS]: {
      priority: true,
      data: function (erd) {
        return (erd.data[0]*255 + erd.data[1])/60
      }
    },
    [TIME_MINS]: {
      priority: true,
      data: function (erd) {
        return erd.data[1]
      }
    },
    [CYCLE_SELECTED]: {
      priority: true,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [END_CYCLE]: {
      priority: true,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [WATER_TEMP]: {
      priority: false,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [SPIN_LEVEL]: {
      priority: false,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [SOIL_LEVEL]: {
      priority: false,
      data: function (erd) {
        return erd.data[0]
      }
    },
    [MACHINE_STATUS]: {
      priority: true,
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
