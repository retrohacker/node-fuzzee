var Transform = require('stream').Transform
var util = require('util')
var tokens = require('./definitions/tokens.js')

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
  var symbols = this.s.replace(tokens.terminators,' $& ').split(/[ \t\v]+/)
  this.s = symbols.pop()
  symbols = symbols.map(function(c,i,a) {
    var curr = c;
    var keys = Object.keys(tokens)
    for(var i = 0; i < keys.length; i++) {
      var v = keys[i]
      var token = tokens[v]
      if(typeof token === 'object') { //regex
        if(c.match(token)) {
          return v
        }
      } else { //string
        if(token === c) {
          return v
        }
      }
    }
    return {value:c}
  })
  //symbols is now an array of all the symbols we have thus far
  console.log(symbols)
  //cb(null,JSON.stringify(chunk))
}

fuzzee.prototype.set = function set(key,val) {
}

fuzzee.prototype.get = function get(key) {

}

fuzzee.prototype.evaluate = function evaluate() {
}

module.exports = fuzzee
