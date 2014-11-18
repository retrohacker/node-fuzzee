var Transform = require('stream').Transform
var util = require('util')

var fuzzee = module.exports = function constructor(fsl) {
  Transform.call(this)
  console.log("test")
  if(!fsl) {
    //We are a stream
  } else{
    this.prototype = new Object(Object.prototype)
  }
}
util.inherits(fuzzee, Transform);
fuzzee.prototype._transform = transform


function transform(chunk,encoding,cb) {
  cb(null,chunk)
}

fuzzee.prototype.set = function set(key,val) {
}

fuzzee.prototype.get = function get(key) {

}

fuzzee.prototype.evaluate = function evaluate() {
}
