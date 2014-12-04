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
    this._obj = {}

    this._lexer.end(fsl)
    
    this._parser.on('data', function(data) {
      self.js += data
    })
    this._parser.on('end', function() {
      var m = new module.constructor();
      try {
        m._compile(self.js)
        for(var func in m.exports) {
          obj = m.exports[func]
          self._obj[func] = new obj()
          if(Object.keys(m.exports).length == 1) {
            self._currentObj = self._obj[func]
          }
        }
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

fuzzee.prototype.setFunction = function(name) {
  if(typeof this._obj[name] != 'undefined') {
    this._currentObj = this._obj[name]
  }
  else {
    throw 'Unknown function ' + name + ', choices are ' + this._obj.keys.join(', ')
  }
}

fuzzee.prototype.set = function(key,val) {
  if(typeof this._currentObj != 'undefined') {
    this._currentObj.set(key, val)
  }
  else {
    throw 'Please select a function before calling set'
  }
}

fuzzee.prototype.get = function(key) {
  if(typeof this._currentObj != 'undefined') {
    return this._currentObj.get(key)
  }
  else {
    throw 'Please select a function before calling get'
  }
}

fuzzee.prototype.evaluate = function() {
  if(typeof this._currentObj != 'undefined') {
    this._currentObj.evaluate()
  }
  else {
    throw 'Please select a function before calling evaluate'
  }
}

module.exports = fuzzee
