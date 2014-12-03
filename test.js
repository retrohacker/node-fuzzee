var Fuzzee = require('./index.js')
var fuzzee = new Fuzzee()
var Parser = require('./parser.js')
var parser = new Parser()

process.stdin.pipe(fuzzee).pipe(parser).pipe(process.stdout)
