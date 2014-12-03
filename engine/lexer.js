var Transform = require('stream').Transform
var util = require('util')

var tokens = require('../constants/tokens')

var lexer = module.exports = function constructor(fsl) {
  Transform.call(this, {objectMode: true})
  this._string = ''
}
util.inherits(lexer, Transform);

lexer.prototype._transform = function(chunk, encoding, cb) {
  this._string += chunk

  // Split around terminators
  var symbols = this._string.replace(new RegExp("\\(|\\)|:=|:|,|;|[\f\n\r]+",'g'),' $& ').split(/[ \t\v]+/)

  this._string = symbols.pop()

  // Tokenize symbols
  symbols = getTokens(symbols)

  // Strip out comments
  symbols = removeComments(symbols)
  cb(null, symbols)
}

/**
 * get Tokens takes an array of symbols and maps them to their token equivalent
 */
function getTokens(symbols) {
  return symbols.map(function(c,i,a) {
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
}

function removeComments(symbols) {
  var result = []
  // 0 == none, 1 = multi, 2 = single
  var comment = 0
  for(var i = 0; i < symbols.length; i++) {
    var symbol = symbols[i]
    if(typeof symbol === 'object') {
      if(comment===0) {
        result.push(symbol)
      }
      continue;
    }

    switch(comment) {
    case 1: // multiline comment
      if(symbol === "MULTILINE_COMMENT_END_TKN")
        comment = 0
    break;
    case 2: // singleline comment
      if(symbol === "NEWLINE_TKN")
        comment = 0
    break;
    default: //no comment
      switch(symbol) {
      case "MULTILINE_COMMENT_START_TKN":
        comment = 1
      break;
      case "SINGLELINE_COMMENT_START_TKN":
        comment = 2
      break;
      case "NEWLINE_TKN": // ignore newlines
      break;
      default:
        result.push(symbol)
      }
    }
  }
  return result
}