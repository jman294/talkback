const exec = require('child_process').exec

const tts = (function () {
  const ttsCmd = 'espeak '

  function speak (text, language, callback) {
    exec(ttsCmd.concat('"'+text+'"').concat(' -v '+language), function (err) {
      if (err) throw err
      if (callback) callback()
    })
  }

  return {
    speak
  }
})()

module.exports = tts
