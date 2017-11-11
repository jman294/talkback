const enumerations = (function () {

  const en = {
    soilLevel: {
      0: 'extra light',
      1: 'light',
      2: 'normal',
      3: 'heavy',
      4: 'extra heavy'
    },

    spinLevel: {
      0: 'no spin',
      1: 'unused',
      2: 'medium',
      3: 'high',
      4: 'extra high',
      5: 'disabled'
    },

    waterTemp: {
      21: 'hot',
      20: 'warm',
      19: 'colors',
      18: 'cool',
      17: 'cold',
      16: 'tap cold'
    },

    machineStatus: {
      0: 'idle',
      1: 'waiting',
      2: 'run',
      3: 'pause',
      4: 'end of cycle',
      6: 'delay run',
      7: 'delay pause'
    },

    loadSize: {
      0: 'small',
      1: 'medium',
      2: 'large',
      3: 'super',
      4: 'precise fill'
    },

    cycle: {
      0: 'blank',
      1: 'basket_clean',
      2: 'rinse_and_spin',
      3: 'quick_rinse',
      4: 'bulky_items',
      5: 'sanitize',
      6: 'towels_and_sheets',
      7: 'steam_refresh',
      8: 'normal',
      9: 'whites',
      10: 'darks',
      11: 'jeans',
      12: 'hand_wash',
      13: 'delicates',
      14: 'speed_wash',
      15: 'heavy_duty',
      16: 'allergen',
      17: 'power_clean',
      18: 'rinse_and_spin',
      19: 'single_item',
      20: 'colors',
      21: 'cold_wash',
      22: 'water_station',
      128: 'cottons',
      129: 'easy_care',
      130: 'active_wear',
      131: 'time_dry',
      132: 'dewrinkle',
      133: 'air_fluff',
      134: 'steam_refresh',
      135: 'steam_dewrinkle',
      136: 'speed_dry',
      137: 'mixed',
      138: 'speed_dry',
      139: 'casuals',
      140: 'warm_up',
      141: 'energy_saver'
    },

    dryTemp: {
      1: 'no heat',
      2: 'low',
      3: 'medium',
      4: 'high'
    },

    stainPretreat: {
      0: 'off',
      1: 'tomato',
      2: 'wine',
      3: 'blood',
      4: 'grass',
      5: 'dirt'
    },

    deepFill: {
      0: 'off',
      1: ''
    }
  }

  const es = {
    soilLevel: {
      0: 'extra light',
      1: 'light',
      2: 'normal',
      3: 'heavy',
      4: 'extra heavy'
    },

    spinLevel: {
      0: 'no spin',
      1: 'unused',
      2: 'medium',
      3: 'high',
      4: 'extra high',
      5: 'disabled'
    },

    waterTemp: {
      21: 'hot',
      20: 'warm',
      19: 'colors',
      18: 'cool',
      17: 'cold',
      16: 'tap cold'
    },

    machineStatus: {
      0: 'idle',
      1: 'standby',
      2: 'run',
      3: 'paused',
      4: 'end of cycle',
      6: 'delay run',
      7: 'delay pause'
    },

    cycle: {
      0: 'blank',
      1: 'basket_clean',
      2: 'rinse_and_spin',
      3: 'quick_rinse',
      4: 'bulky_items',
      5: 'sanitize',
      6: 'towels_and_sheets',
      7: 'steam_refresh',
      8: 'normal',
      9: 'whites',
      10: 'darks',
      11: 'jeans',
      12: 'hand_wash',
      13: 'delicates',
      14: 'speed_wash',
      15: 'heavy_duty',
      16: 'allergen',
      17: 'power_clean',
      18: 'rinse_and_spin',
      19: 'single_item',
      20: 'colors',
      21: 'cold_wash',
      128: 'cottons',
      129: 'easy_care',
      130: 'active_wear',
      131: 'time_dry',
      132: 'dewrinkle',
      133: 'air_fluff',
      134: 'steam_refresh',
      135: 'steam_dewrinkle',
      136: 'speed_dry',
      137: 'mixed',
      138: 'speed_dry',
      139: 'casuals',
      140: 'warm_up',
      141: 'energy_saver'
    },

    dryTemp: {
      1: 'no heat',
      2: 'low',
      3: 'medium',
      4: 'high'
    },

    stainPretreat: {
      0: 'off',
      1: 'tomato',
      2: 'wine',
      3: 'blood',
      4: 'grass',
      5: 'dirt'
    },

    deepFill: {
      0: 'off',
      1: ''
    }
  }


  function makeReadable (text) {
    return text.replace(/[_-]/g, ' ')
  }

  return {
    en,
    es,
    makeReadable
  }
})()

module.exports = enumerations
