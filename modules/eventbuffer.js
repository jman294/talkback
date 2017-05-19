const eventbuffer = function () {

  const TIME_LENGTH = 5

  let timeout = -1
  let finishCallback = null

  let currentBuffer = []

  function onFinish (callback) {
    finishCallback = callback
  }

  function finish () {
    finishCallback(currentBuffer)
    currentBuffer = []
  }

  function resetTimer () {
    if (timeout != -1) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(finish, TIME_LENGTH)
  }

  function add (value) {
    currentBuffer.push(value)
    resetTimer()
  }

  return Object.freeze({
    onFinish,
    add
  })
}

module.exports = eventbuffer
