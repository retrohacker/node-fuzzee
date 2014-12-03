/*
 * Command line interface to test Fuzzee
 *
 * Two ways to use:
 * Pipe mode:
 * cat tests/validation/junit_tipper.fcl | node test-cli
 * 
 * File mode:
 * node test-cli tests/validation/junit_tipper.fcl
 */

var fs = require('fs')

var Fuzzee = require('./index')

// String mode
if(process.argv[2]) {
  var stream = fs.createReadStream(process.argv[2])
  var string = ''
  stream.on('data',function(data) {
    string += data.toString()
  })

  stream.on('end',function() {
    var fuzzee = new Fuzzee(string)
    fuzzee.on('end', function() {
      console.log(fuzzee.js)
    })
  })
}
// Pipe mode
else {
  fuzzee = new Fuzzee()
  process.stdin.pipe(fuzzee).pipe(process.stdout)
}