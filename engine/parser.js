var Transform = require('stream').Transform
var util = require('util')

var states = require('../constants/states')
var objects = require('./generator')

var Stack = require('../objects/stack')

var parser = module.exports = function constructor() {
  Transform.call(this, {objectMode: true})
  this._currentState = states.START_STATE
  this._stack = new Stack()
  this._tokens = []
  this._vars = []
  this._neededTokens = 0
  this._returnObjects = []
}
util.inherits(parser, Transform);

parser.prototype._transform = function(chunk, encoding, cb) {
  this._tokens = this._tokens.concat(chunk)

  if(this._tokens.length >= this._neededTokens) {
    this._neededTokens = this._run()
  }

  retString = ''
  while(this._returnObjects.length > 0) {
    retString += this._returnObjects.shift().toString()
  }
  cb(null, retString)
}

parser.prototype._run = function () {
  while(true) {
    switch(this._currentState) {
      case states.START_STATE:
        if(this._tokens.length < 2) {
          return 2;
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
              this._stack.push(new objects.FunctionBlock())
              this._stack.top().set('name', funcName.value)
              this._currentState = states.FUNCTION_STATE
            }
          }
        }
        break

      case states.FUNCTION_STATE:
        if(this._tokens.length == 0) {
          return 1
        }
        else {
          switch(this._tokens[0]) {
            case 'VAR_INPUT_BLOCK_START_TKN':
              this._tokens.shift()
              this._stack.push(new objects.VarBlock())
              this._currentState = states.INVARS_STATE
              break
            case 'VAR_OUTPUT_BLOCK_START_TKN':
              this._tokens.shift()
              this._stack.push(new objects.VarBlock())
              this._currentState = states.OUTVARS_STATE
              break
            case 'VAR_BLOCK_START_TKN':
              this._tokens.shift()
              this._stack.push(new objects.VarBlock())
              this._currentState = states.OTHERVARS_STATE
              break
            case 'FUZZIFY_BLOCK_START_TKN':
            case 'DEFUZZIFY_BLOCK_START_TKN':
            case 'RULEBLOCK_BLOCK_START_TKN':
              if(this._tokens.length == 1) {
                return 2
              }
              else {
                block = this._tokens.shift()

                switch(block) {
                  case 'FUZZIFY_BLOCK_START_TKN':
                    this._stack.push(new objects.FuzzifyBlock())
                    this._currentState = states.FUZZ_STATE

                    varName = this._tokens.shift()
                    if(typeof varName != 'object') {
                      this._throwStateError('Fuzzify block declaration must be followed by name')
                    }
                    else {
                      this._stack.top().set('var', this._getVar(varName.value))
                    }
                    break

                  case 'DEFUZZIFY_BLOCK_START_TKN':
                    this._stack.push(new objects.DefuzzifyBlock())
                    this._currentState = states.DEFUZZ_STATE

                    varName = this._tokens.shift()
                    if(typeof varName != 'object') {
                      this._throwStateError('Defuzzify block declaration must be followed by name')
                    }
                    else {
                      this._stack.top().set('var', this._getVar(varName.value))
                    }
                    break

                  case 'RULEBLOCK_BLOCK_START_TKN':
                    this._stack.push(new objects.RuleBlock())
                    this._currentState = states.RULE_BLOCK_STATE

                    if(typeof this._tokens[0] == 'object') {
                      this._stack.top().set('name', this._tokens.shift().value)
                    }
                    break
                }
              }
              break
            case 'FUNCTION_BLOCK_END_TKN':
              this._tokens.shift()
              func = this._stack.pop()
              func.validate()
              this._returnObjects.push(func)
              this._vars = []
              this._neededTokens = 0
              this._currentState = states.START_STATE
              break
            default:
              this._throwStateError('Function block must contain var, fuzzify, defuzzify, or rule block')
          }
        }
        break
      case states.INVARS_STATE:
        if(this._tokens.length == 0) {
          return 1
        }
        else if(this._tokens[0] == 'VAR_BLOCK_END_TKN') {
          this._tokens.shift()
          this._stack.merge('varBlocks')
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.indexOf('SEMICOLON_TKN') == -1) {
          return 0
        }
        else {
          this._stack.push(new objects.Var({type: objects.VarTypes.INPUT}))
          varName = this._tokens.shift()
          if(typeof varName != 'object') {
            this._throwStateError('Var line must begin with a variable name')
          }
          else {
            this._stack.top().set('name', varName.value)
          }
          this._currentState = states.VAR_STATE
        }
        break

      case states.OUTVARS_STATE:
        if(this._tokens.length == 0) {
          return 0
        }
        else if(this._tokens[0] == 'VAR_BLOCK_END_TKN') {
          this._tokens.shift()
          this._stack.merge('varBlocks')
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.indexOf('SEMICOLON_TKN') == -1) {
          return 0
        }
        else {
          this._stack.push(new objects.Var({type: objects.VarTypes.OUTPUT}))
          varName = this._tokens.shift()
          if(typeof varName != 'object') {
            this._throwStateError('Var line must begin with a variable name')
          }
          else {
            this._stack.top().set('name', varName.value)
          }
          this._currentState = states.VAR_STATE
        }
        break

      case states.OTHERVARS_STATE:
        if(this._tokens.length == 0) {
          return 1
        }
        else if(this._tokens[0] == 'VAR_BLOCK_END_TKN') {
          this._tokens.shift()
          this._stack.merge('varBlocks')
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.indexOf('SEMICOLON_TKN') == -1) {
          return 0
        }
        else {
          this._stack.push(new objects.Var({type: objects.VarTypes.LOCAL}))
          varName = this._tokens.shift()
          if(typeof varName != 'object') {
            this._throwStateError('Var line must begin with a variable name')
          }
          else {
            this._stack.top().set('name', varName.value)
          }
          this._currentState = states.VAR_STATE
        }
        break

      case states.VAR_STATE:
        this._checkColon('Var names and types')

        varType = this._tokens.shift()

        if(varType == 'REAL_VAR_TKN') {
          this._stack.top().set('dataType', objects.VarDataTypes.REAL)
        }
        else {
          this._throwStateError('Unknown var data type: ' + varType)
        }

        this._checkSemicolon('Var definitions')

        this._addVar(this._stack.top().name, this._stack.top())

        type = this._stack.top().type

        this._stack.merge('vars')

        switch(type) {
          case objects.VarTypes.INPUT:
            this._currentState = states.INVARS_STATE
            break
          case objects.VarTypes.OUTPUT:
            this._currentState = states.OUTVARS_STATE
            break
          case objects.VarTypes.LOCAL:
            this._currentState = states.OTHERVARS_STATE
            break
        }
        break

      case states.FUZZ_STATE:
        if(this._tokens.length == 0) {
          return 1
        }
        else {
          switch(this._tokens.shift()) {
            case 'FUZZIFY_BLOCK_END_TKN':
              this._stack.merge('fuzzifyBlocks')
              this._currentState = states.FUNCTION_STATE
              break

            case 'TERM_TKN':
              this._stack.push(new objects.Term())
              this._currentState = states.TERM_STATE
              break

            default:
              this._throwStateError('Fuzzification blocks must only contain terms')
          }
        }
        break

      case states.DEFUZZ_STATE:
        if(this._tokens.length == 0) {
          return 1
        }
        else {
          switch(this._tokens[0]) {
            case 'DEFUZZIFY_BLOCK_END_TKN':
              this._tokens.shift()
              this._stack.merge('defuzzifyBlocks')
              this._currentState = states.FUNCTION_STATE
              break

            case 'TERM_TKN':
              this._tokens.shift()
              this._stack.push(new objects.Term())
              this._currentState = states.TERM_STATE
              break

            case 'METHOD_TKN':
              if(this._tokens.indexOf('SEMICOLON_TKN') == -1) {
                return 0
              }
              this._tokens.shift()
              this._checkColon('Method declarations')

              switch(this._tokens.shift()) {
                case  'COG_METHOD_TKN':
                  this._stack.top().set('defuzzMethod', objects.DefuzzMethods.COG)
                  break

                case 'COGS_METHOD_TKN':
                  this._stack.top().set('defuzzMethod', objects.DefuzzMethods.COGS)
                  break

                case 'COA_METHOD_TKN':
                  this._stack.top().set('defuzzMethod', objects.DefuzzMethods.COA)
                  break

                case 'LM_METHOD_TKN':
                  this._stack.top().set('defuzzMethod', objects.DefuzzMethods.LM)
                  break

                case 'RM_METHOD_TKN':
                  this._stack.top().set('defuzzMethod', objects.DefuzzMethods.RM)
                  break

                default:
                  this._throwStateError('Unknown defuzzification method')
              }

              this._checkSemicolon('Method definitions')
              break

            case 'DEFAULT_TKN':
              if(this._tokens.indexOf('SEMICOLON_TKN') == -1) {
                return 0
              }
              this._tokens.shift()
              this._checkAssign('Defuzzification default', 'value')

              def = this._tokens.shift()
              if(typeof def == 'object') {
                this._stack.top().set('defaultVal', new objects.DefuzzDefVal({value: def.value}))
              }
              else if(def == 'DEFAULT_NC_TKN') {
                this._stack.top().set('defaultVal', new objects.DefuzzDefVal({isNC: true}))
              }
              else {
                this._throwStateError('Unknown default defuzzification value')
              }

              this._checkSemicolon('Default defuzzification value')
              break

            case 'RANGE_TKN':
              if(this._tokens.indexOf('SEMICOLON_TKN') == -1) {
                return 0
              }
              this._tokens.shift()
              this._checkAssign('Defuzzification range', 'value')

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

              this._stack.top().set('range', new objects.DefuzzRange({min: min.value, max: max.value}))
              break

            default:
              this._throwStateError('Invalid declaration in defuzzification block')
          }
        }
        break

      case states.TERM_STATE:
        if(this._tokens.indexOf('SEMICOLON_TKN') == -1) {
          return 0
        }
        else {
          termName = this._tokens.shift()

          if(typeof termName != 'object') {
            this._throwStateError('Term name must be provided')
          }
          else {
            this._stack.top().set('name', termName.value)
          }

          this._checkAssign('Term', 'function')

          switch(this._tokens[0]) {
            case 'TRIAN_TKN':
              this._tokens.shift()
              min = this._getNumOrVar(this._tokens.shift(), 'Trian parameters')
              mid = this._getNumOrVar(this._tokens.shift(), 'Trian parameters')
              max = this._getNumOrVar(this._tokens.shift(), 'Trian parameters')

              this._stack.top().set('func', new objects.Trian({min: min, mid: mid, max: max}))

              this._checkSemicolon('Term definitions')
              break

            case 'TRAPE_TKN':
              this._tokens.shift()
              min = this._getNumOrVar(this._tokens.shift(), 'Trape parameters')
              midLow = this._getNumOrVar(this._tokens.shift(), 'Trape parameters')
              midHigh = this._getNumOrVar(this._tokens.shift(), 'Trape parameters')
              max = this._getNumOrVar(this._tokens.shift(), 'Trape parameters')

              this._stack.top().set('func', new objects.Trape({min: min, midLow: midLow, midHigh: midHigh, max: max}))

              this._checkSemicolon('Term definitions')
              break

            case 'GAUSS_TKN':
              this._tokens.shift()
              mean = this._getNumOrVar(this._tokens.shift(), 'Gauss parameters')
              stdev = this._getNumOrVar(this._tokens.shift(), 'Gauss parameters')

              this._stack.top().set('func', new objects.Gauss({mean: mean, stdev: stdev}))

              this._checkSemicolon('Term definitions')
              break

            case 'GBELL_TKN':
              this._tokens.shift()
              a = this._getNumOrVar(this._tokens.shift(), 'Gbell parameters')
              b = this._getNumOrVar(this._tokens.shift(), 'Gbell parameters')
              mean = this._getNumOrVar(this._tokens.shift(), 'Gbell parameters')

              this._stack.top().set('func', new objects.Gbell({a: a, b: b, mean: mean}))

              this._checkSemicolon('Term definitions')
              break

            case 'SIGM_TKN':
              this._tokens.shift()
              gain = this._getNumOrVar(this._tokens.shift(), 'Sigm parameters')
              center = this._getNumOrVar(this._tokens.shift(), 'Sigm parameters')

              this._stack.top().set('func', new objects.Sigm({gain: gain, center: center}))

              this._checkSemicolon('Term definitions')
              break

            case 'LEFT_PAREN_TKN':
              piecewise = new objects.Piecewise({points: []})

              while(this._tokens[0] == 'LEFT_PAREN_TKN') {
                this._tokens.shift()

                x = this._getNumOrVar(this._tokens.shift(), 'Point parameters')

                if(this._tokens.shift() != 'COMMA_TKN') {
                  this._throwStateError('Piecewise points must have two comma-separated values')
                }

                y = this._getNumOrVar(this._tokens.shift(), 'Point parameters')

                if(this._tokens.shift() != 'RIGHT_PAREN_TKN') {
                  this._throwStateError('Unmatched left parenthesis in piecewise point')
                }

                piecewise.set('func', piecewise.points.push(new objects.Point({x: x, y: y})))
              }

              this._stack.top().set('func', piecewise)

              this._checkSemicolon('Term definitions')
              break

            case 'FUNC_TKN':
              this._tokens.shift()
              funString = ''
              while(this._tokens[0] != 'SEMICOLON_TKN') {
                tkn = this._tokens.shift()
                if(typeof tkn == 'object') {
                  if(this._isNumber(tkn.value) || this._isSymbol(tkn.value)) {
                    funString += this._jsMathFunctions(tkn.value)
                  }
                  else {
                    v = this._getVar(tkn.value)
                    if(v != null) {
                      funString += v.toString()
                    }
                    else {
                      this._throwVarError(tkn.value)
                    }
                  }
                }
                else {
                  switch(tkn) {
                    case 'LEFT_PAREN_TKN':
                      funString += '('
                      break
                    case 'RIGHT_PAREN_TKN':
                      funString += ')'
                      break
                    default:
                      this._throwStateError('Unknown token in term function declaration')
                  }
                }
              }

              this._stack.top().set('func', new objects.Func({func: funString}))

              this._checkSemicolon('Term definitions')
              break

            default:
              if(typeof this._tokens[0] == 'object') {
                val = this._getNumOrVar(this._tokens.shift(), 'Singleton parameters')

                this._stack.top().set('func', new objects.Singleton({value: val}))

                this._checkSemicolon('Term definitions')
              }
              else {
                this._throwStateError('Unrecognized token in term definition')
              }
          }

          this._stack.merge('terms')

          // Set terms to appropriate var for checking in rule phase
          this._stack.top().var.set('terms', this._stack.top().terms)

          if(this._stack.top() instanceof objects.FuzzifyBlock) {
            this._currentState = states.FUZZ_STATE
          }
          else {
            this._currentState = states.DEFUZZ_STATE
          }
        }
        break

      case states.RULE_BLOCK_STATE:
        if(this._tokens.length == 0) {
          return 1
        }
        else if(this._tokens[0] == 'RULEBLOCK_BLOCK_END_TKN') {
          this._tokens.shift()
          this._stack.merge('ruleBlocks')
          this._currentState = states.FUNCTION_STATE
        }
        else if(this._tokens.indexOf('SEMICOLON_TKN') == -1) {
          return 0
        }
        else {
          andDef = new objects.OperatorDef({operator: objects.Operators.AND})
          orDef = new objects.OperatorDef({operator: objects.Operators.OR})

          switch(this._tokens.shift()) {
            case 'RULE_TKN':
              ruleNum = this._tokens.shift()
              if(typeof ruleNum != 'object') {
                this._throwStateError('Rules must begin with a number')
              }
              else {
                this._stack.push(new objects.Rule({number: parseInt(ruleNum.value)}))
                this._currentState = states.RULE_STATE
              }
              break

            case 'AND_TKN':
              this._checkColon('Ruleblock operator definitions')

              switch(this._tokens.shift()) {
                case 'MIN_TKN':
                  andDef.set('func', objects.OperatorFuncs.MIN)
                  orDef.set('func', objects.OperatorFuncs.MAX)
                  break

                case 'PROD_TKN':
                  andDef.set('func', objects.OperatorFuncs.PROD)
                  orDef.set('func', objects.OperatorFuncs.ASUM)
                  break

                case 'AND_METHOD_BDIF_TKN':
                  andDef.set('func', objects.OperatorFuncs.BDIF)
                  orDef.set('func', objects.OperatorFuncs.BSUM)
                  break

                default:
                  this._throwStateError('Unknown AND operator definition in ruleblock')
              }

              this._stack.top().set('andOperatorDef', andDef)
              this._stack.top().set('orOperatorDef', orDef)

              this._checkSemicolon('Ruleblock operator definitions')
              break

            case 'OR_TKN':
              this._checkColon('Ruleblock operator definitions')

              switch(this._tokens.shift()) {
                case 'MAX_TKN':
                  andDef.set('func', objects.OperatorFuncs.MIN)
                  orDef.set('func', objects.OperatorFuncs.MAX)
                  break

                case 'OR_METHOD_ASUM_TKN':
                  andDef.set('func', objects.OperatorFuncs.PROD)
                  orDef.set('func', objects.OperatorFuncs.ASUM)
                  break

                case 'BSUM_TKN':
                  andDef.set('func', objects.OperatorFuncs.BDIF)
                  orDef.set('func', objects.OperatorFuncs.BSUM)
                  break

                default:
                  this._throwStateError('Unknown OR operator definition in ruleblock')
              }

              this._stack.top().set('andOperatorDef', andDef)
              this._stack.top().set('orOperatorDef', andDef)

              this._checkSemicolon('Ruleblock operator definitions')
              break

            case 'ACTIVATION_METHOD_TKN':
              this._checkColon('Ruleblock activation method definitions')

              switch(this._tokens.shift()) {
                case 'PROD_TKN':
                  this._stack.top().set('activationMethod', objects.ActivationMethods.PROD)
                  break

                case 'MIN_TKN':
                  this._stack.top().set('activationMethod', objects.ActivationMethods.MIN)
                  break

                default:
                  this._throwStateError('Unknown activation method in ruleblock')
              }

              this._checkSemicolon('Ruleblock activation method definitions')
              break

            case 'ACCUMULATION_METHOD_TKN':
              this._checkColon('Ruleblock accumulation method definitions')

              switch(this._tokens.shift()) {
                case 'MAX_TKN':
                  this._stack.top().set('accumulationMethod', objects.AccumulationMethods.MAX)
                  break

                case 'BSUM_TKN':
                  this._stack.top().set('accumulationMethod', objects.AccumulationMethods.BSUM)
                  break

                case 'ACCUM_METHOD_NSUM_TKN':
                  this._stack.top().set('accumulationMethod', objects.AccumulationMethods.NSUM)
                  break

                default:
                  this._throwStateError('Unknown accumulation method in ruleblock')
              }

              this._checkSemicolon('Ruleblock accumulation method definitions')
              break

            default:
              this._throwStateError('Unknown declaration in ruleblock')
          }
        }
        break

      case states.RULE_STATE:
        this._checkColon('Rule numbers and definitions')

        if(this._tokens.shift() != 'IF_CONDITION_TKN') {
          this._throwStateError('Rules must begin with an IF clause')
        }

        subTokens = []
        while(this._tokens[0] != 'THEN_CONDITION_TKN') {
          if(this._tokens[0] == 'SEMICOLON_TKN' || this._tokens[0] == 'WITH_CONDITION_TKN') {
            this._throwStateError('Rules must contain a THEN clause')
          }
          else {
            subTokens.push(this._tokens.shift())
          }
        }

        this._stack.top().set('ifCond', this._recursiveExpr(subTokens))

        this._tokens.shift()
        this._stack.top().set('thenCond', [])
        while(this._tokens[0] != 'SEMICOLON_TKN' && this._tokens[0] != 'WITH_CONDITION_TKN') {
          assert = new objects.Assertion()

          v = this._getVar(this._tokens.shift().value)
          assert.set('var', v)

          if(this._tokens.shift() != 'IS_LOGIC_TKN') {
            this._throwStateError('Consequents must be separated by IS')
          }

          if(this._tokens[0] == 'NOT_LOGIC_TKN') {
            assert.set('not', true)
            this._tokens.shift()
          }

          tkn = this._tokens.shift().value
          term = this._getVarTerm(v, tkn)
          if(term == null) {
            this._throwStateError('Var ' + v.name + ' does not have term ' + tkn)
          }
          else {
            assert.set('term', term)
          }

          this._stack.top().set('thenCond', this._stack.top().thenCond.concat([assert]))

          if(this._tokens[0] == 'COMMA_TKN') {
            this._tokens.shift()
          }
        }

        if(this._tokens[0] == 'WITH_CONDITION_TKN') {
          this._tokens.shift()

          w = this._getNumOrVar(this._tokens.shift(), 'With conditions')
          this._stack.top().set('withCond', new objects.WithCond({value: w}))
        }

        this._checkSemicolon('Rule numbers and definitions')

        this._stack.merge('rules')

        this._currentState = states.RULE_BLOCK_STATE
        break
    }
  }
}

parser.prototype._jsMathFunctions = function(token) {
  return token.replace('SIN', 'Math.sin').replace('COSINE', 'Math.cos')
}

parser.prototype._recursiveExpr = function(tokens) {
  // Resolve all assertions to objects
  while(tokens.indexOf('IS_LOGIC_TKN') != -1) {
    assert = new objects.Assertion()
    isTkn = tokens.indexOf('IS_LOGIC_TKN')
    varTkn = isTkn - 1
    termTkn = isTkn + 1

    v = this._getVar(tokens[varTkn].value)
    assert.set('var', v)

    if(tokens[termTkn] == 'NOT_LOGIC_TKN') {
      assert.set('not', true)
      termTkn++
    }

    term = this._getVarTerm(v, tokens[termTkn].value)
    if(term == null) {
      this._throwStateError('Var ' + v.name + ' does not have term ' + tokens[termTkn].value)
    }
    else {
      assert.set('term', term)
    }

    tokens = tokens.slice(0, varTkn).concat([assert]).concat(tokens.slice(termTkn + 1, tokens.length))
  }

  // Recursively resolve all parenthetical expressions
  while(tokens.indexOf('LEFT_PAREN_TKN') != -1) {
    parenStart = tokens.indexOf('LEFT_PAREN_TKN')
    counter = parenStart + 1
    numLeftParen = 1
    while(numLeftParen > 0) {
      if(tokens[counter] == 'LEFT_PAREN_TKN') {
        numLeftParen++
      }
      if(tokens[counter] == 'RIGHT_PAREN_TKN') {
        numLeftParen--
      }
    }

    expr = [this._recursiveExpr(tokens.slice(parenStart + 1, counter))]
    tokens = tokens.slice(0, parenStart - 1).concat(expr).concat(tokens.slice(counter + 1))
  }

  // Resolve all ANDs to expressions
  while(tokens.indexOf('AND_TKN') != -1) {
    and = tokens.indexOf('AND_TKN')
    expr = new objects.Expression({operator: objects.Operators.AND})
    expr.set('firstHalf', tokens[and - 1])
    expr.set('secondHalf', tokens[and + 1])
    tokens = tokens.slice(0, and - 1).concat([expr]).concat(tokens.slice(and + 2, tokens.length))
  }

  // Resolve all ORs to expressions
  while(tokens.indexOf('OR_TKN') != -1) {
    or = tokens.indexOf('OR_TKN')
    expr = new objects.Expression({operator: objects.Operators.OR})
    expr.set('firstHalf', tokens[or - 1])
    expr.set('secondHalf', tokens[or + 1])
    tokens = tokens.slice(0, or - 1).concat([expr]).concat(tokens.slice(or + 2, tokens.length))
  }

  // Should now just be one expression left
  return tokens[0]
}

parser.prototype._isNumber = function(v) {
  return !isNaN(parseInt(v))
}

parser.prototype._isSymbol = function(v) {
  return ['+', '-', '*', '/', '%', 'SIN', 'COS'].indexOf(v) != -1
}

parser.prototype._getNumOrVar = function(tkn, context) {
  if(typeof tkn != 'object') {
    this._throwStateError(context + ' must be numbers or variables')
  }
  else if(this._isNumber(tkn.value)) {
    return tkn.value
  }
  else {
    v = this._getVar(tkn.value)
    if(v == null) {
      this._throwVarError(tkn.value)
    }
    else {
      return v
    }
  }
}

parser.prototype._getVar = function(name) {
  filtered = this._vars.filter(function(v) {
    return v.name == name
  })

  if(filtered.length == 0) {
    return null
  }
  else {
    return filtered[0]
  }
}

parser.prototype._addVar = function(name, v) {
  if(this._getVar(name) != null) {
    this._throwStateError('Duplicate var declaration: ' + name)
  }
  else {
    this._vars.push(v)
  }
}

parser.prototype._getVarTerm = function(v, name) {
  filtered = v.terms.filter(function(t) {
    return t.name == name
  })

  if(filtered.length == 0) {
    return null
  }
  else {
    return filtered[0]
  }
}

parser.prototype._checkAssign = function(contextStart, contextEnd) {
  if(this._tokens.shift() != 'ASSIGN_TKN') {
    this._throwStateError(contextStart + ' must be assigned a ' + contextEnd)
  }
}

parser.prototype._checkSemicolon = function(context) {
  if(this._tokens.shift() != 'SEMICOLON_TKN') {
    this._throwStateError(context + ' must be terminated by a semicolon')
  }
}

parser.prototype._checkColon = function(context) {
  if(this._tokens.shift() != 'COLON_TKN') {
    this._throwStateError(context + ' must be separated by a colon')
  }
}

parser.prototype._throwVarError = function(name) {
  this._throwStateError('Unknown var: ' + name)
}

parser.prototype._throwStateError = function(msg) {
  throw 'State error: ' + msg
}

module.exports = parser
