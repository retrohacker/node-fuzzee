var Transform = require('stream').Transform
var util = require('util')
var tokens = require('./constants.js')

var fuzzee = module.exports = function constructor(fsl) {
  Transform.call(this)
  this.s = ""
  if(!fsl) {
    //We are a stream
  } else{
    this.prototype = new Object(Object.prototype)
  }
}
util.inherits(fuzzee, Transform);
fuzzee.prototype._transform = transform

function transform(chunk,encoding,cb) {
  this.s += chunk
  console.log(tokens)
  console.log(this.s.replace(/[\n\f\r]+/,' $&').split(/[ \t\v]+/))
  var symbols = this.s.replace(tokens.NEWLINE,' $&').split(/[ \t\v]+/)
  this.s = symbols.pop()
  //console.log(symbols)
  //cb(null,chunk)
}

fuzzee.prototype.set = function set(key,val) {
}

fuzzee.prototype.get = function get(key) {

}

fuzzee.prototype.evaluate = function evaluate() {
}

module.exports = fuzzee
