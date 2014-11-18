var fuzzee = require('../index.js')
var glob = require('glob')
var fs = require('fs')
var async = require('async')
var path = require('path')
var assert = require('assert')

describe('Validation',function(next1) {
  it('should load and lex files',function(next2) {
    this.timeout(5000)
    glob('./tests/validation/*.fcl',function(e,files) {
      assert(!e,"Exception caught while globbing: "+e)
      async.each(files,function(file,cb) {
        var basename = path.basename(file,'.fcl')
        var fuzzeeWatch = new fuzzee()
        try {
          fs.createReadStream(file).pipe(fuzzeeWatch).pipe(fs.createWriteStream(path.join(__dirname,"tmp",basename+".js")))
        } catch(e) {
          if(e) return assert(!e,"Encountered errors during streaming: "+e)
        }
        fuzzeeWatch.on('error',function(e) {
          assert(!e,"Exception should not be thrown when lexing")
        })
        fuzzeeWatch.on('end',function() {
          var logic
          try {
            logic = require(path.join(__dirname,"tmp",basename+".js"))
          } catch(e) {
            assert(!e,"File was not created: "+e)
          }
          next()
        })
        
      },function(e) {
        assert(!e,"Exception caught while reading files"+e)
        next2()
      })
    })
  })
})
