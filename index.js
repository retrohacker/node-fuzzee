var Transform = require('stream').Transform
var util = require('util')

var Lexer = require('./engine/lexer')
var Parser = require('./engine/parser')

var fuzzee = module.exports = function constructor(fsl) {
  var self = this

  this._lexer = new Lexer()
  this._parser = new Parser()
  this._lexer.pipe(this._parser)

  if(!fsl) {
    // We are a stream
    Transform.call(this)
  } 
  else {
    this.prototype = new Object(Object.prototype)

    this.js = ''

    this._lexer.end(fsl)
    
    this._parser.on('data', function(data) {
      self.js += data
    })
    this._parser.on('end', function() {
      var m = new module.constructor();
      try {
        m._compile(self.js);
        self._obj = m.exports;
      }
      catch(e) {
        // The output node module was invalid
      }
      self.emit('end')
    })
  }
}

util.inherits(fuzzee, Transform);

fuzzee.prototype._transform = function(chunk,encoding,cb) {
  this._lexer.write(chunk)
  cb(null, this._parser.read())
}

fuzzee.prototype.set = function set(key,val) {
  // Operate on this._obj
}

fuzzee.prototype.get = function get(key) {

}

fuzzee.prototype.evaluate = function evaluate() {
}

module.exports = fuzzee
