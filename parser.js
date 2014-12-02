var states = require('./definitions/states')
var t = require('./definitions/tokens')
var objects = require('./definitions/objects')

var parser = module.exports = function constructor() {
  this._currentState = states.START_STATE
  this._objectHeap = []
  this._tokens = []
  this._returnObjects = []
}

parser.prototype.nextToken = function nextTokens(newTokens) {
  this._tokens.concat(newTokens)

  while(true) {
    switch(this._currentState) {
      case states.START_STATE:
        if(this._tokens.size == 0) {
          return this._returnVal()
        }
        else {
          if(this._tokens.shift() != t.FUNCTION_BLOCK_START_TKN) {
            this._throwStateError("Engine must start with function block definition")
          }
          else {
            funcName = this._tokens.shift()
            if(typeof funcName != 'object') {
              this._throwStateError("Function declaration must be followed by name")
            }
            else {
              this._addHeapObject(new objects.FunctionBlock())
              this._topHeapObject().set("name", funcName.value)
              this._currentState = states.FUNCTION_STATE
            }
          }
        }
        break

      case states.FUNCTION_STATE:
        if(this._tokens.size == 0) {
          return this._returnVal()
        }
        else {
          switch(this._tokens.first) {
            case t.VAR_INPUT_BLOCK_START_TKN:
              this._addHeapObject(new objects.VarBlock())
              this._currentState = states.INVARS_STATE
              break

            case t.VAR_OUTPUT_BLOCK_START_TKN:
              this._addHeapObject(new objects.VarBlock())
              this._currentState = states.OUTVARS_STATE
              break

            case t.VAR_BLOCK_START_TKN:
              this._addHeapObject(new objects.VarBlock())
              this._currentState = states.OTHERVARS_STATE
              break

            case t.FUZZIFY_BLOCK_START_TKN:
            case t.DEFUZZIFY_BLOCK_START_TKN:
            case t.RULEBLOCK_BLOCK_START_TKN:
              if(this._tokens.size == 1) {
                return this._returnVal()
              }
              else {
                block = this._tokens.shift()

                switch(block) {
                  case t.FUZZIFY_BLOCK_START_TKN:
                    this._addHeapObject(new objects.FuzzifyBlock())
                    this._currentState = states.FUZZ_STATE
                    break

                  case t.DEFUZZIFY_BLOCK_START_TKN:
                    this._addHeapObject(new objects.DefuzzifyBlock())
                    this._currentState = states.FUZZ_STATE
                    break

                  case t.RULEBLOCK_BLOCK_START_TKN:
                    this._addHeapObject(new objects.RuleBlock())
                    this._currentState = states.FUZZ_STATE
                    break
                }

                this._topHeapObject().set("name", this._tokens.shift().value)
              }
            default:
              this._throwStateError("Function block must contain var, fuzzify, defuzzify, or rule block")
          }
        }
        break

      case states.INVARS_STATE:
        if(this._tokens.size == 0) {
          return this._returnVal()
        }
        else if(this._tokens.first == t.VAR_BLOCK_END_TKN) {
          this._mergeHeapArrayObject("varBlocks")
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.size < 4) {
          return this._returnVal()
        }
        else {
          varName = this._tokens.shift()
          if(typeof varName != 'object') {
            this._throwStateError("Var line must begin with a variable name")
          }
          else {
            obj = new objects.Var({name: varName, type: objects.VarTypes.INPUT})
          }

          if(this._tokens.shift() != t.COLON_TKN) {
            this._throwStateError("Var names and types must be separated by a colon")
          }

          varType = this._tokens.shift()

          if(varType == objects.VarDataTypes.REAL) {
            obj.set("dataType", objects.VarDataTypes.REAL)
          }
          else {
            this._throwStateError("Unknown var data type: " + varType)
          }

          if(this._tokens.shift() != t.SEMICOLON_TKN) {
            this._throwStateError("Var definitions must be terminated by a semicolon")
          }
        }
        break

      case states.OUTVARS_STATE:
        if(this._tokens.size == 0) {
          return this._returnVal()
        }
        else if(this._tokens.first == t.VAR_BLOCK_END_TKN) {
          this._mergeHeapArrayObject("varBlocks")
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.size < 4) {
          return this._returnVal()
        }
        else {
          varName = this._tokens.shift()
          if(typeof varName != 'object') {
            this._throwStateError("Var line must begin with a variable name")
          }
          else {
            obj = new objects.Var({name: varName, type: objects.VarTypes.OUTPUT})
          }

          if(this._tokens.shift() != t.COLON_TKN) {
            this._throwStateError("Var names and types must be separated by a colon")
          }

          varType = this._tokens.shift()

          if(varType == objects.VarDataTypes.REAL) {
            obj.set("dataType", objects.VarDataTypes.REAL)
          }
          else {
            this._throwStateError("Unknown var data type: " + varType)
          }

          if(this._tokens.shift() != t.SEMICOLON_TKN) {
            this._throwStateError("Var definitions must be terminated by a semicolon")
          }
        }
        break

      case states.OTHERVARS_STATE:
        if(this._tokens.size == 0) {
          return this._returnVal()
        }
        else if(this._tokens.first == t.VAR_BLOCK_END_TKN) {
          this._mergeHeapArrayObject("varBlocks")
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.size < 4) {
          return this._returnVal()
        }
        else {
          varName = this._tokens.shift()
          if(typeof varName != 'object') {
            this._throwStateError("Var line must begin with a variable name")
          }
          else {
            obj = new objects.Var({name: varName, type: objects.VarTypes.LOCAL})
          }

          if(this._tokens.shift() != t.COLON_TKN) {
            this._throwStateError("Var names and types must be separated by a colon")
          }

          varType = this._tokens.shift()

          if(varType == objects.VarDataTypes.REAL) {
            obj.set("dataType", objects.VarDataTypes.REAL)
          }
          else {
            this._throwStateError("Unknown var data type: " + varType)
          }

          if(this._tokens.shift() != t.SEMICOLON_TKN) {
            this._throwStateError("Var definitions must be terminated by a semicolon")
          }
        }
        break

      case states.FUZZ_STATE:
        if(this._tokens.length == 0) {
          return returnVal()
        }
        else if(this._tokens.first() == t.FUZZIFY_BLOCK_END_TKN) {
          this._mergeHeapArrayObject("fuzzifyBlocks")
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.first() == t.TERM_TKN) {
          if(this._tokens.indexOf(t.SEMICOLON_TKN) == -1) {
            return returnVal()
          }
          else {
            this._tokens.shift()

            termName = this._tokens.shift()

            if(typeof termName != 'object') {
              this._throwStateError("Term name must be provided")
            }
            else {
              this._addHeapObject(new objects.TERM())
              this._topHeapObject().set("name", termName)
            }

            if(this._tokens.shift() != t.ASSIGN_TKN) {
              this._throwStateError("Term must be assigned function")
            }

            switch(this._tokens.first) {
              case TRIAN_TKN:
                this._tokens.shift()
                min = this._tokens.shift()
                mid = this._tokens.shift()
                max = this._tokens.shift()

                if(typeof min != 'object' || typeof mid != 'object' || typeof max != 'object') {
                  this._throwStateError("Trian parameters must be numbers")
                }

                this._topHeapObject().set("func", new exports.Trian({min: min.value, mid: mid.value, max: max.value}))

                if(this._tokens.shift() != t.SEMICOLON_TKN) {
                  this._throwStateError("Term definitions must be terminated by a semicolon")
                }
                break

              case TRAPE_TKN:
                this._tokens.shift()
                min = this._tokens.shift()
                midLow = this._tokens.shift()
                midHigh = this._tokens.shift()
                max = this._tokens.shift()

                if(typeof min != 'object' || typeof midLow != 'object' || typeof midHigh != 'object' || typeof max != 'object') {
                  this._throwStateError("Trape parameters must be numbers")
                }

                this._topHeapObject().set("func", new exports.Trape({min: min.value, midLow: midLow.value, midHigh: midHigh.value, max: max.value}))

                if(this._tokens.shift() != t.SEMICOLON_TKN) {
                  this._throwStateError("Term definitions must be terminated by a semicolon")
                }
                break

              case GAUSS_TKN:
                this._tokens.shift()
                mean = this._tokens.shift()
                stdev = this._tokens.shift()

                if(typeof mean != 'object' || typeof stdev != 'object') {
                  this._throwStateError("Gauss parameters must be numbers")
                }

                this._topHeapObject().set("func", new exports.Gauss({mean: mean.value, stdev: stdev.value}))

                if(this._tokens.shift() != t.SEMICOLON_TKN) {
                  this._throwStateError("Term definitions must be terminated by a semicolon")
                }
                break

              case GBELL_TKN:
                this._tokens.shift()
                a = this._tokens.shift()
                b = this._tokens.shift()
                mean = this._tokens.shift()

                if(typeof a != 'object' || typeof b != 'object' || typeof mean != 'object' || typeof max != 'object') {
                  this._throwStateError("Gbell parameters must be numbers")
                }

                this._topHeapObject().set("func", new exports.Gbell({a: a.value, b: b.value, mean: mean.value}))

                if(this._tokens.shift() != t.SEMICOLON_TKN) {
                  this._throwStateError("Term definitions must be terminated by a semicolon")
                }
                break

              case SIGM_TKN:
                this._tokens.shift()
                gain = this._tokens.shift()
                center = this._tokens.shift()

                if(typeof gain != 'object' || typeof center != 'object') {
                  this._throwStateError("Sigm parameters must be numbers")
                }

                this._topHeapObject().set("func", new exports.Sigm({gain: gain.value, center: center.value}))

                if(this._tokens.shift() != t.SEMICOLON_TKN) {
                  this._throwStateError("Term definitions must be terminated by a semicolon")
                }
                break

              case LEFT_PAREN_TKN:
                piecewise = new exports.Piecewise({points: []})

                while(this._tokens.first == t.LEFT_PAREN_TKN) {
                  this._tokens.shift()

                  x = this._tokens.shift()
                  if(typeof x != 'object') {
                    this._throwStateError("Piecewise functions must have integer points")
                  }

                  if(this._tokens.shift() != t.COMMA_TKN) {
                    this._throwStateError("Piecewise points must have two comma-separated values")
                  }

                  y = this._tokens.shift()
                  if(typeof y != 'object') {
                    this._throwStateError("Piecewise functions must have integer points")
                  }

                  if(this._tokens.shift() != t.RIGHT_PAREN_TKN) {
                    this._throwStateError("Unmatched left parenthesis in piecewise point")
                  }

                  piecewise.set("func", piecewise.points.push(new exports.Point({x: x, y: y})))
                }

                this._topHeapObject().set("func", piecewise)

                if(this._tokens.shift() != t.SEMICOLON_TKN) {
                  this._throwStateError("Term definitions must be terminated by a semicolon")
                }
                break

              case FUNC_TKN:
                // FUNCTION (inVar * 3.0) + 5 * SIN(inVar);

                break

              default:
                if(typeof this._tokens.first == 'object') {
                  this._topHeapObject().set("func", new exports.Singleton({value: this._tokens.shift().value}))

                  if(this._tokens.shift() != t.SEMICOLON_TKN) {
                    this._throwStateError("Term definitions must be terminated by a semicolon")
                  }
                }
                else {
                  if(this._tokens.shift() != t.SEMICOLON_TKN) {
                    this._throwStateError("Unrecognized token in term definition")
                  }
                }
            }
          }
        }
        else {
          this._throwStateError("Fuzzification blocks must only contain terms")
        }
        break

      case states.DEFUZZ_STATE:
        break

      case states.RULE_BLOCKSTATE:

        break

      case states.FIN_STATE:

        break
    }
  }
}

parser.prototype._throwStateError = function(msg) {
  throw "State error: "
}

parser.prototype._addHeapObject = function(obj) {
  this._objectHeap.push(obj)
}

parser.prototype._topHeapObject = function() {
  return this._objectHeap[this._objectHeap.length - 1]
}

parser.prototype._mergeHeapObject = function(varName) {
  childObj = this._objectHeap.pop()
  this._topHeapObject().set(varName, childObj)
}

parser.prototype._mergeHeapArrayObject = function(varName) {
  childObj = this._objectHeap.pop()
  this._topHeapObject().set(varName, this._topHeapObject()[varName].concat(childObj))
}

parser.prototype._returnVal = function() {
  if(this._returnObjects.length == 0) {
    return null
  }
  else {
    objs = []
    obj = this._returnObjects.shift()
    while(typeof obj != 'undefined') {
      objs.push(obj)
      obj = this._returnObjects.shift()
    }
    return objs
  }
}