var Transform = require('stream').Transform
var util = require('util')

var nameArray = require('../constants/tokens').nameArray
var tokenArray = require('../constants/tokens').tokenArray
var regexArray = require('../constants/tokens').regexArray

var lexer = module.exports = function constructor(fsl) {
  Transform.call(this, {objectMode: true})
}
util.inherits(lexer, Transform);

lexer.prototype._transform = function(chunk, encoding, cb) {
  // Split around terminators
  var symbols = chunk.toString().replace(new RegExp("\\(|\\)|:=|:|,|;|[\f\n\r]+",'g'),' $& ').split(/[ \t\v]+/)

  // Remove last symbol if file is newline terminated
  if(symbols[symbols.length - 1] == '') {
    symbols.pop()
  }

  // Write out tokenized symbols
  cb(null, getTokens(symbols))
}

/**
 * get Tokens takes an array of symbols and maps them to their token equivalent
 */
function getTokens(symbols) {
  tokens = []
  inSingleLineComment = false
  inMultiLineComment = false

  symbols.forEach(function(c) {
    if(!inSingleLineComment && !inMultiLineComment) {
      if(c == '//') {
        inSingleLineComment = true
        return
      }
      else if((k = tokenArray.indexOf(c)) != -1) {
        tokens.push(nameArray[k])
        return
      }
    }

    for(i = 0; i < regexArray.length; i++) {
      if(c.match(regexArray[i])) {
        switch(i) {
          case 0:
            // Multiline comment start
            inMultiLineComment = true
            break

          case 1:
            // Multiline comment end
            inMultiLineComment = false
            break

          case 2:
            // Newline
            inSingleLineComment = false
        }

        return
      }
    }

    if(!inSingleLineComment && !inMultiLineComment) {
      tokens.push({value: c})
    }
  })

  return tokens
}