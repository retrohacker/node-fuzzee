var states = require('./definitions/states')
var tokens = require('./definitions/tokens')
var objects = require('./definitions/objects')

var currentState, objectHeap, tokens, returnObjects

function throwStateError(msg) {
  throw "State error: "
}

function addHeapObject(obj) {
  objectHeap.push(obj)
}

function topHeapObject() {
  return objectHeap[objectHeap.length - 1]
}

function mergeHeapObject(varName) {
  var childObj = objectHeap.pop()
  topHeapObject().set(varName, childObj)
}

function mergeHeapArrayObject(varName) {
  var childObj = objectHeap.pop()
  topHeapObject().set(varName, topHeapObject()[varName].concat(childObj));
}

function returnVal() {
  if(returnObjects.length == 0) {
    return null
  }
  else {
    objs = []
    obj = returnObjects.shift()
    while(typeof obj != 'undefined') {
      objs.push(obj)
      obj = returnObjects.shift()
    }
    return objs
  }
}

var parser = module.exports = function constructor() {
  currentState = states.START_STATE
  objectHeap = []
  tokens = []
}

parser.prototype.nextToken = function nextTokens(newTokens) {
  tokens.concat(newTokens)

  while(true) {
    switch(currentState) {
      case states.START_STATE:
        if(tokens.size == 0) {
          return returnVal()
        }
        else {
          if(tokens.shift() != tokens.FUNCTION_BLOCK_START_TKN) {
            throwStateError("Engine must start with function block definition")
          }
          else {
            funcName = tokens.shift()
            if(typeof funcName != 'object') {
              throwStateError("Function declaration must be followed by name")
            }
            else {
              addHeapObject(new objects.FunctionBlock())
              topHeapObject.set("name", funcName.value)
              currentState = states.FUNCTION_STATE
            }
          }
        }
        break

      case states.FUNCTION_STATE:
        if(tokens.size == 0) {
          return returnVal()
        }
        else {
          switch(tokens.first) {
            case tokens.VAR_INPUT_BLOCK_START_TKN:
              addHeapObject(new objects.VarBlock())
              currentState = states.INVARS_STATE
              break

            case tokens.VAR_OUTPUT_BLOCK_START_TKN:
              addHeapObject(new objects.VarBlock())
              currentState = states.OUTVARS_STATE
              break

            case tokens.VAR_BLOCK_START_TKN:
              addHeapObject(new objects.VarBlock())
              currentState = states.OTHERVARS_STATE
              break

            case tokens.FUZZIFY_BLOCK_START_TKN:
            case tokens.DEFUZZIFY_BLOCK_START_TKN:
            case tokens.RULEBLOCK_BLOCK_START_TKN:
              if(tokens.size == 1) {
                return returnVal()
              }
              else {
                block = tokens.shift()

                switch(block) {
                  case tokens.FUZZIFY_BLOCK_START_TKN:
                    addHeapObject(new objects.FuzzifyBlock())
                    currentState = states.FUZZ_STATE
                    break

                  case tokens.DEFUZZIFY_BLOCK_START_TKN:
                    addHeapObject(new objects.DefuzzifyBlock())
                    currentState = states.FUZZ_STATE
                    break

                  case tokens.RULEBLOCK_BLOCK_START_TKN:
                    addHeapObject(new objects.RuleBlock())
                    currentState = states.FUZZ_STATE
                    break
                }

                topHeapObject.set("name", tokens.shift().value)
              }
            default:
              throwStateError("Function block must contain var, fuzzify, defuzzify, or rule block")
          }
        }
        break

      case states.INVARS_STATE:
        if(tokens.size == 0) {
          return returnVal()
        }
        else if(tokens.first == tokens.VAR_BLOCK_END_TKN) {
          mergeHeapArrayObject("varBlocks")
          currentState = states.FUNCTION_STATE
        }
        else if(tokens.size < 4) {
          return returnVal()
        }
        else {
          varName = tokens.shift()
          if(typeof varName != 'object') {
            throwStateError("Var line must begin with a variable name")
          }
          else {
            obj = new objects.Var({name: varName, type: objects.VarTypes.INPUT})
          }

          if(tokens.shift() != COLON_TKN) {
            throwStateError("Var names and types must be separated by a colon")
          }

          varType = tokens.shift()

          if(varType == objects.VarDataTypes.REAL) {
            obj.set("dataType", objects.VarDataTypes.REAL)
          }
          else {
            throwStateError("Unknown var data type: " + varType)
          }

          if(tokens.shift() != SEMICOLON_TKN) {
            throwStateError("Var definitions must be terminated by a semicolon")
          }
        }
        break

      case states.OUTVARS_STATE:
        if(tokens.size == 0) {
          return returnVal()
        }
        else if(tokens.first == tokens.VAR_BLOCK_END_TKN) {
          mergeHeapArrayObject("varBlocks")
          currentState = states.FUNCTION_STATE
        }
        else if(tokens.size < 4) {
          return returnVal()
        }
        else {
          varName = tokens.shift()
          if(typeof varName != 'object') {
            throwStateError("Var line must begin with a variable name")
          }
          else {
            obj = new objects.Var({name: varName, type: objects.VarTypes.OUTPUT})
          }

          if(tokens.shift() != COLON_TKN) {
            throwStateError("Var names and types must be separated by a colon")
          }

          varType = tokens.shift()

          if(varType == objects.VarDataTypes.REAL) {
            obj.set("dataType", objects.VarDataTypes.REAL)
          }
          else {
            throwStateError("Unknown var data type: " + varType)
          }

          if(tokens.shift() != SEMICOLON_TKN) {
            throwStateError("Var definitions must be terminated by a semicolon")
          }
        }
        break

      case states.OTHERVARS_STATE:
        if(tokens.size == 0) {
          return returnVal()
        }
        else if(tokens.first == tokens.VAR_BLOCK_END_TKN) {
          mergeHeapArrayObject("varBlocks")
          currentState = states.FUNCTION_STATE
        }
        else if(tokens.size < 4) {
          return returnVal()
        }
        else {
          varName = tokens.shift()
          if(typeof varName != 'object') {
            throwStateError("Var line must begin with a variable name")
          }
          else {
            obj = new objects.Var({name: varName, type: objects.VarTypes.LOCAL})
          }

          if(tokens.shift() != COLON_TKN) {
            throwStateError("Var names and types must be separated by a colon")
          }

          varType = tokens.shift()

          if(varType == objects.VarDataTypes.REAL) {
            obj.set("dataType", objects.VarDataTypes.REAL)
          }
          else {
            throwStateError("Unknown var data type: " + varType)
          }

          if(tokens.shift() != SEMICOLON_TKN) {
            throwStateError("Var definitions must be terminated by a semicolon")
          }
        }
        break

      case states.FUZZ_STATE:
        
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