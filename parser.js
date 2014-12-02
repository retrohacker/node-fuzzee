var states = require('./definitions/states')
var objects = require('./definitions/objects')

var parser = module.exports = function constructor() {
  this._currentState = states.START_STATE
  this._objectHeap = []
  this._tokens = []
  this._returnObjects = []
}

parser.prototype = new Object(Object.prototype)
parser.prototype.constructor = parser
module.exports = parser

parser.prototype.nextToken = function nextTokens(newTokens) {
  this._tokens = this._tokens.concat(newTokens)

  while(true) {
    switch(this._currentState) {
      case states.START_STATE:
        if(this._tokens.length == 0) {
          return this._returnVal()
        }
        else {
          if(this._tokens.shift() != 'FUNCTION_BLOCK_START_TKN') {
            this._throwStateError('Engine must start with function block definition')
          }
          else {
            funcName = this._tokens.shift()
            if(typeof funcName != 'object') {
              this._throwStateError('Function declaration must be followed by name')
            }
            else {
              this._addHeapObject(new objects.FunctionBlock())
              this._topHeapObject().set('name', funcName.value)
              this._currentState = states.FUNCTION_STATE
            }
          }
        }
        break

      case states.FUNCTION_STATE:
        if(this._tokens.length == 0) {
          return this._returnVal()
        }
        else {
          switch(this._tokens[0]) {
            case 'VAR_INPUT_BLOCK_START_TKN':
              this._tokens.shift()
              this._addHeapObject(new objects.VarBlock())
              this._currentState = states.INVARS_STATE
              break
            case 'VAR_OUTPUT_BLOCK_START_TKN':
              this._tokens.shift()
              this._addHeapObject(new objects.VarBlock())
              this._currentState = states.OUTVARS_STATE
              break
            case 'VAR_BLOCK_START_TKN':
              this._tokens.shift()
              this._addHeapObject(new objects.VarBlock())
              this._currentState = states.OTHERVARS_STATE
              break
            case 'FUZZIFY_BLOCK_START_TKN':
            case 'DEFUZZIFY_BLOCK_START_TKN':
            case 'RULEBLOCK_BLOCK_START_TKN':
              if(this._tokens.length == 1) {
                return this._returnVal()
              }
              else {
                block = this._tokens.shift()

                switch(block) {
                  case 'FUZZIFY_BLOCK_START_TKN':
                    this._addHeapObject(new objects.FuzzifyBlock())
                    this._currentState = states.FUZZ_STATE
                    break

                  case 'DEFUZZIFY_BLOCK_START_TKN':
                    this._addHeapObject(new objects.DefuzzifyBlock())
                    this._currentState = states.DEFUZZ_STATE
                    break

                  case 'RULEBLOCK_BLOCK_START_TKN':
                    this._addHeapObject(new objects.RuleBlock())
                    this._currentState = states.RULE_BLOCK_STATE
                    break
                }

                this._topHeapObject().set('name', this._tokens.shift().value)
              }
              break
            case 'FUNCTION_BLOCK_END_TKN':
              this._tokens.shift()
              this._returnObjects.push(this._objectHeap.pop())
              this._currentState = states.START_STATE
              break
            default:
              this._throwStateError('Function block must contain var, fuzzify, defuzzify, or rule block')
          }
        }
        break
      case states.INVARS_STATE:
        if(this._tokens.length == 0) {
          return this._returnVal()
        }
        else if(this._tokens[0] == 'VAR_BLOCK_END_TKN') {
          this._tokens.shift()
          this._mergeHeapArrayObject('varBlocks')
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.length < 4) {
          return this._returnVal()
        }
        else {
          varName = this._tokens.shift()
          if(typeof varName != 'object') {
            this._throwStateError('Var line must begin with a variable name')
          }
          else {
            obj = new objects.Var({name: varName, type: objects.VarTypes.INPUT})
          }

          if(this._tokens.shift() != 'COLON_TKN') {
            this._throwStateError('Var names and types must be separated by a colon')
          }

          varType = this._tokens.shift()

          if(varType == 'REAL_VAR_TKN') {
            obj.set('dataType', objects.VarDataTypes.REAL)
          }
          else {
            this._throwStateError('Unknown var data type: ' + varType)
          }

          this._checkSemicolon('Var definitions')
        }
        break

      case states.OUTVARS_STATE:
        if(this._tokens.length == 0) {
          return this._returnVal()
        }
        else if(this._tokens[0] == 'VAR_BLOCK_END_TKN') {
          this._tokens.shift()
          this._mergeHeapArrayObject('varBlocks')
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.length < 4) {
          return this._returnVal()
        }
        else {
          varName = this._tokens.shift()
          if(typeof varName != 'object') {
            this._throwStateError('Var line must begin with a variable name')
          }
          else {
            obj = new objects.Var({name: varName, type: objects.VarTypes.OUTPUT})
          }

          if(this._tokens.shift() != 'COLON_TKN') {
            this._throwStateError('Var names and types must be separated by a colon')
          }

          varType = this._tokens.shift()

          if(varType == 'REAL_VAR_TKN') {
            obj.set('dataType', objects.VarDataTypes.REAL)
          }
          else {
            this._throwStateError('Unknown var data type: ' + varType)
          }

          this._checkSemicolon('Var definitions')
        }
        break

      case states.OTHERVARS_STATE:
        if(this._tokens.length == 0) {
          return this._returnVal()
        }
        else if(this._tokens[0] == 'VAR_BLOCK_END_TKN') {
          this._tokens.shift()
          this._mergeHeapArrayObject('varBlocks')
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.length < 4) {
          return this._returnVal()
        }
        else {
          varName = this._tokens.shift()
          if(typeof varName != 'object') {
            this._throwStateError('Var line must begin with a variable name')
          }
          else {
            obj = new objects.Var({name: varName, type: objects.VarTypes.LOCAL})
          }

          if(this._tokens.shift() != 'COLON_TKN') {
            this._throwStateError('Var names and types must be separated by a colon')
          }

          varType = this._tokens.shift()

          if(varType == 'REAL_VAR_TKN') {
            obj.set('dataType', objects.VarDataTypes.REAL)
          }
          else {
            this._throwStateError('Unknown var data type: ' + varType)
          }

          this._checkSemicolon('Var definitions')
        }
        break

      case states.FUZZ_STATE:
        if(this._tokens.length == 0) {
          return returnVal()
        }
        else {
          switch(this._tokens.shift()) {
            case 'FUZZIFY_BLOCK_END_TKN':
              this._mergeHeapArrayObject('fuzzifyBlocks')
              this._currentState = states.FUNCTION_STATE
              break

            case 'TERM_TKN':
              this._addHeapObject(new objects.Term())
              this._currentState = states.TERM_STATE
              break

            default:
              this._throwStateError('Fuzzification blocks must only contain terms')
          }
        }
        break

      case states.DEFUZZ_STATE:
        if(this._tokens.length == 0) {
          return returnVal()
        }
        else {
          switch(this._tokens.shift()) {
            case 'DEFUZZIFY_BLOCK_END_TKN':
              this._mergeHeapArrayObject('defuzzifyBlocks')
              this._currentState = states.FUNCTION_STATE
              break

            case 'TERM_TKN':
              this._addHeapObject(new objects.Term())
              this._currentState = states.TERM_STATE
              break

            case 'METHOD_TKN':
              if(this._tokens.shift() != 'COLON_TKN') {
                this._throwStateError('Method must be denoted by a colon')
              }

              switch(this._tokens.shift()) {
                case  'COG_METHOD_TKN':
                  this._topHeapObject().set('defuzzMethod', objects.DefuzzMethods.COG)
                  break

                case 'COGS_METHOD_TKN':
                  this._topHeapObject().set('defuzzMethod', objects.DefuzzMethods.COGS)
                  break

                case 'COA_METHOD_TKN':
                  this._topHeapObject().set('defuzzMethod', objects.DefuzzMethods.COA)
                  break

                case 'LM_METHOD_TKN':
                  this._topHeapObject().set('defuzzMethod', objects.DefuzzMethods.LM)
                  break

                case 'RM_METHOD_TKN':
                  this._topHeapObject().set('defuzzMethod', objects.DefuzzMethods.RM)
                  break

                default:
                  this._throwStateError('Unknown defuzzification method')
              }

              this._checkSemicolon('Method definitions')
              break

            case 'DEFAULT_TKN':
              if(this._tokens.shift() != 'ASSIGN_TKN') {
                // @TODO: Strip out this if condition after lexer bug fixed
                if(this._tokens.shift() != 'terminators') {
                  this._throwStateError('Default must be assigned value')
                }
              }

              def = this._tokens.shift()
              if(typeof def == 'object') {
                this._topHeapObject().set('defaultVal', new objects.DefuzzDefVal({value: def.value}))
              }
              else if(def == 'DEFAULT_NC_TKN') {
                this._topHeapObject().set('defaultVal', new objects.DefuzzDefVal({isNC: true}))
              }
              else {
                this._throwStateError('Unknown default defuzzification value')
              }

              this._checkSemicolon('Default defuzzification value')
              break

            case 'RANGE_TKN':
              if(this._tokens.shift() != 'ASSIGN_TKN') {
                // @TODO: Strip out this if condition after lexer bug fixed
                if(this._tokens.shift() != 'terminators') {
                  this._throwStateError('Defuzzification range must be assigned value')
                }
              }

              if(this._tokens.shift() != 'LEFT_PAREN_TKN') {
                this._throwStateError('Defuzzification range must be denoted by parentheses')
              }

              min = this._tokens.shift()
              if(typeof min != 'object') {
                this._throwStateError('Defuzzification range values must be numbers')
              }

              if(this._tokens.shift() != 'RANGE_DOT_TKN') {
                this._throwStateError('Defuzzification range must be separated by ..')
              }

              max = this._tokens.shift()
              if(typeof max != 'object') {
                this._throwStateError('Defuzzification range values must be numbers')
              }

              this._checkSemicolon('Defuzzification range')

              this._topHeapObject().set('range', new objects.DefuzzRange({min: min.value, max: max.value}))
              break

            default:
              this._throwStateError('Invalid declaration in defuzzification block')
          }
        }
        break

      case states.TERM_STATE:
        if(this._tokens.indexOf('SEMICOLON_TKN') == -1) {
          return returnVal()
        }
        else {
          termName = this._tokens.shift()

          if(typeof termName != 'object') {
            this._throwStateError('Term name must be provided')
          }
          else {
            this._topHeapObject().set('name', termName)
          }

          if(this._tokens.shift() != 'ASSIGN_TKN') {
            // @TODO: Strip out this if condition after lexer bug fixed
            if(this._tokens.shift() != 'terminators') {
              this._throwStateError('Term must be assigned function')
            }
          }

          switch(this._tokens[0]) {
            case 'TRIAN_TKN':
              this._tokens.shift()
              min = this._tokens.shift()
              mid = this._tokens.shift()
              max = this._tokens.shift()

              if(typeof min != 'object' || typeof mid != 'object' || typeof max != 'object') {
                this._throwStateError('Trian parameters must be numbers')
              }

              this._topHeapObject().set('func', new objects.Trian({min: min.value, mid: mid.value, max: max.value}))

              this._checkSemicolon('Term definitions')

              this._mergeHeapArrayObject('terms')
              break

            case 'TRAPE_TKN':
              this._tokens.shift()
              min = this._tokens.shift()
              midLow = this._tokens.shift()
              midHigh = this._tokens.shift()
              max = this._tokens.shift()

              if(typeof min != 'object' || typeof midLow != 'object' || typeof midHigh != 'object' || typeof max != 'object') {
                this._throwStateError('Trape parameters must be numbers')
              }

              this._topHeapObject().set('func', new objects.Trape({min: min.value, midLow: midLow.value, midHigh: midHigh.value, max: max.value}))

              this._checkSemicolon('Term definitions')

              this._mergeHeapArrayObject('terms')
              break

            case 'GAUSS_TKN':
              this._tokens.shift()
              mean = this._tokens.shift()
              stdev = this._tokens.shift()

              if(typeof mean != 'object' || typeof stdev != 'object') {
                this._throwStateError('Gauss parameters must be numbers')
              }

              this._topHeapObject().set('func', new objects.Gauss({mean: mean.value, stdev: stdev.value}))

              this._checkSemicolon('Term definitions')

              this._mergeHeapArrayObject('terms')
              break

            case 'GBELL_TKN':
              this._tokens.shift()
              a = this._tokens.shift()
              b = this._tokens.shift()
              mean = this._tokens.shift()

              if(typeof a != 'object' || typeof b != 'object' || typeof mean != 'object' || typeof max != 'object') {
                this._throwStateError('Gbell parameters must be numbers')
              }

              this._topHeapObject().set('func', new objects.Gbell({a: a.value, b: b.value, mean: mean.value}))

              this._checkSemicolon('Term definitions')

              this._mergeHeapArrayObject('terms')
              break

            case 'SIGM_TKN':
              this._tokens.shift()
              gain = this._tokens.shift()
              center = this._tokens.shift()

              if(typeof gain != 'object' || typeof center != 'object') {
                this._throwStateError('Sigm parameters must be numbers')
              }

              this._topHeapObject().set('func', new objects.Sigm({gain: gain.value, center: center.value}))

              this._checkSemicolon('Term definitions')

              this._mergeHeapArrayObject('terms')
              break

            case 'LEFT_PAREN_TKN':
              piecewise = new objects.Piecewise({points: []})

              while(this._tokens[0] == 'LEFT_PAREN_TKN') {
                this._tokens.shift()

                x = this._tokens.shift()
                if(typeof x != 'object') {
                  this._throwStateError('Piecewise functions must have integer points')
                }

                if(this._tokens.shift() != 'COMMA_TKN') {
                  this._throwStateError('Piecewise points must have two comma-separated values')
                }

                y = this._tokens.shift()
                if(typeof y != 'object') {
                  this._throwStateError('Piecewise functions must have integer points')
                }

                if(this._tokens.shift() != 'RIGHT_PAREN_TKN') {
                  this._throwStateError('Unmatched left parenthesis in piecewise point')
                }

                piecewise.set('func', piecewise.points.push(new objects.Point({x: x, y: y})))
              }

              this._topHeapObject().set('func', piecewise)

              this._checkSemicolon('Term definitions')

              this._mergeHeapArrayObject('terms')
              break

            case 'FUNC_TKN':
              // FUNCTION (inVar * 3.0) + 5 * SIN(inVar);

              break

            default:
              if(typeof this._tokens[0] == 'object') {
                this._topHeapObject().set('func', new objects.Singleton({value: this._tokens.shift().value}))

                this._checkSemicolon('Term definitions')

                this._mergeHeapArrayObject('terms')
              }
              else {
                this._throwStateError('Unrecognized token in term definition')
              }
          }
        }
        break

      case states.RULE_BLOCK_STATE:

        break
    }
  }
}

parser.prototype._checkSemicolon = function(context) {
  if(this._tokens.shift() != 'SEMICOLON_TKN') {
    this._throwStateError(context + ' must be terminated by a semicolon')
  }
}

parser.prototype._throwStateError = function(msg) {
  throw 'State error: '+msg
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
  if(this._topHeapObject()[varName] != null) {
    this._topHeapObject().set(varName, this._topHeapObject()[varName].concat(childObj))
  }
  else {
    this._topHeapObject().set(varName, [childObj])
  }
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
