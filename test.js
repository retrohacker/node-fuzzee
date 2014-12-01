var Fuzzee = require('./index.js')
var fuzzee = new Fuzzee()

process.stdin.pipe(fuzzee).pipe(process.stdout)
