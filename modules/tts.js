const exec = require('child_process').exec

const tts = (function () {
  const ttsCmd = 'espeak '

  const languages = {
    en: "en-US",
    es: "es"
  }

  function speak (text, language, callback) {
    let cmd = ttsCmd.concat('"'+text+'"')
    if (language !== undefined) {
      cmd = cmd.concat(' -v '+languages[language])
    }
    exec(cmd, function (err) {
      if (err) throw err
      if (callback) callback()
    })
  }

  return {
    speak
  }
})()

module.exports = tts
