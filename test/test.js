var Player = require('play-sound')(opts = {})
var greenBean = require('green-bean')
var uname = require('node-uname')
var assert = require('assert')

var doubleIntervalFunction = function () {
  loops.while(
       () => true,
       () => {
         return new Promise((resolve, reject) => {
           setTimeout(() => {
             laundry.endOfCycle.read(function (endOfCycle) {
               if (endOfCycle) {
                 console.log('end of cycle')
                 reject(loops.break)
               } else {
                 console.log('not end of cycle')
                 resolve()
               }
             }, 1000)
           })
         })
       }
     )
     .then(() => {
       loops.while(
         () => true,
         () => {
           return new Promise((resolve, reject) => {
             setTimeout(() => {
               playBuzzer()
             }, 60000)
           })
         }
       )
     })

  function playbuzzer () {
    player.play('buzzers/chim_60.wav')
  }
}
