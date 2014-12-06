var fuzzee = require('../index')
var glob = require('glob')
var fs = require('fs')
var async = require('async')
var path = require('path')
var assert = require('assert')

filesToSkip = ['./test/validation/junit_cosine.fcl', './test/validation/junit_dsigm.fcl']

describe('Validation',function() {
  it('should load and lex files',function(done) {
    this.timeout(5000)
    glob('./test/validation/*.fcl',function(e,files) {
      files = files.filter(function(f) {
        return filesToSkip.indexOf(f) == -1
      })

      var numFilesProcessed = 0

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

            numFilesProcessed++
            if(numFilesProcessed == files.length - filesToSkip.length) {
              done()
            }
          } catch(e) {
            assert(!e,"File was not created: "+e)
          }
        })
        
      },function(e) {
        assert(!e,"Exception caught while reading files"+e)
        done()
      })
    })
  })
})
