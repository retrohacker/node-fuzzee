var c = require("./tokens")
var STRING_TYPE = "string",
    NUMBER_TYPE = "number",
    BOOL_TYPE = "boolean"

function createObject(o) {
  function F() {}
  F.prototype = o
  return new F()
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

function typeNames(typeArray) {
  types = []
  typeArray.forEach(function(type) {
    if(typeof type.typeName == "undefined") {
      types.push(type)
    }
    else {
      types.push(type.typeName)
    }
  })
  return types.join(", ")
}

function checkExists(d, k) {
  if(d[k] == null) {
    throw "Object " + k + " missing"
  }
  else {
    return d[k]
  }
}

function validateType(v, typeArray) {
  foundType = false
  typeArray.forEach(function(type, index) {
    if(typeof(v) === type || (typeof(v) === "object" && v instanceof type)) {
      foundType = true
    }
  })
  return foundType
}

function checkType(d, k, typeArray, isOpt) {
  if(!isOpt) {
    checkExists(d, k)
  }
  else if(d[k] == null) {
    return null
  }

  if(!isArray(typeArray)) {
    typeArray = [typeArray]
  }

  if(validateType(d[k], typeArray)) {
    return d[k]
  }
  else {
    throw "Object type " + typeof(v) + " does not match required " + typeNames(typeArray) + " in field " + k
  }
}

function checkArrayType(d, k, typeArray, isOpt) {
  if(!isOpt) {
    checkExists(d, k)
  }
  else if(d[k] == null) {
    return null
  }

  if(!isArray(typeArray)) {
    typeArray = [typeArray]
  }

  d[k].forEach(function(e, index) {
    if(!validateType(e, typeArray)) {
      throw "Object type " + typeof(e) + " does not match required " + typeNames(typeArray) + " in field " + k
    }
  })

  return d[k]
}

var BaseObject = function(initHash) {
  for(k in initHash) {
    this[k] = initHash[k]
  }

  this.set = function(k, v) {
    this[k] = v
  }
}

exports.VarType = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.VarType.prototype)
    that.typeName = "VarType"
    that.type = checkType(this, "type", STRING_TYPE, false)
    return that
  }
}
exports.VarType.typeName = "VarType"
varTypes = {
  INPUT: new exports.VarType({type: "INPUT"}),
  OUTPUT: new exports.VarType({type: "OUTPUT"}),
  LOCAL: new exports.VarType({type: "LOCAL"})
}
exports.VarTypes = varTypes

exports.VarDataType = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.VarDataType.prototype)
    that.type = checkType(this, "type", STRING_TYPE, false)
    return that
  }
}
exports.VarDataType.typeName = "VarDataType"
varDataTypes = {}
varDataTypes[c.REAL_VAR_TKN] = new exports.VarDataType({type: c.REAL_VAR_TKN})
exports.VarDataTypes = varDataTypes

exports.Var = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.Var.prototype)
    that.name = checkType(this, "name", STRING_TYPE, false)
    that.type = checkType(this, "type", exports.VarType, false)
    that.dataType = checkType(this, "dataType", exports.VarDataType, false)
    that.value = checkExists(this, "value")
    return that
  }
}
exports.Var.typeName = "Var"

exports.VarBlock = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.Var.prototype)
    that.vars = checkArrayType(this, "vars", exports.Var, false)
    return that
  }
}
exports.VarBlock.typeName = "VarBlock"

/**
 * Membership Functions (all fall under MemFunc type)
 */
exports.Point = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.Point.prototype)
    that.x = checkType(this, "x", [exports.Var, NUMBER_TYPE], false)
    that.y = checkType(this, "y", [exports.Var, NUMBER_TYPE], false)
    return that
  }
}
exports.Point.typeName = "Point"

exports.MemFunc = function() {}
exports.MemFunc.typeName = "MemFunc"

exports.Trian = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.MemFunc.prototype)
    that.min = checkType(this, "min", [exports.Var, NUMBER_TYPE], false)
    that.mid = checkType(this, "mid", [exports.Var, NUMBER_TYPE], false)
    that.max = checkType(this, "max", [exports.Var, NUMBER_TYPE], false)
    return that
  }
}

exports.Trape = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.MemFunc.prototype)
    that.min = checkType(this, "min", [exports.Var, NUMBER_TYPE], false)
    that.midLow = checkType(this, "midLow", [exports.Var, NUMBER_TYPE], false)
    that.midHigh = checkType(this, "midHigh", [exports.Var, NUMBER_TYPE], false)
    that.max = checkType(this, "max", [exports.Var, NUMBER_TYPE], false)
    return that
  }
}

exports.Gauss = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.MemFunc.prototype)
    that.mean = checkType(this, "mean", [exports.Var, NUMBER_TYPE], false)
    that.stdev = checkType(this, "stdev", [exports.Var, NUMBER_TYPE], false)
    return that
  }
}

exports.Gbell = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.MemFunc.prototype)
    that.a = checkType(this, "x", [exports.Var, NUMBER_TYPE], false)
    that.b = checkType(this, "b", [exports.Var, NUMBER_TYPE], false)
    that.mean = checkType(this, "mean", [exports.Var, NUMBER_TYPE], false)
    return that
  }
}

exports.Sigm = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.MemFunc.prototype)
    that.gain = checkType(this, "gain", [exports.Var, NUMBER_TYPE], false)
    that.center = checkType(this, "center", [exports.Var, NUMBER_TYPE], false)
    return that
  }
}

exports.Singleton = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.MemFunc.prototype)
    that.value = checkType(this, "value", [exports.Var, NUMBER_TYPE], false)
    return that
  }
}

exports.Piecewise = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.MemFunc.prototype)
    that.points = checkArrayType(this, "points", exports.Point, false)
    return that
  }
}

exports.Func = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.MemFunc.prototype)
    that.func = checkType(this, "func", STRING_TYPE, false)
    return that
  }
}

memFuncs = {}
memFuncs[c.TRIAN_TKN] = exports.Trian
memFuncs[c.TRAPE_TKN] = exports.Trape
memFuncs[c.GAUSS_TKN] = exports.Gauss
memFuncs[c.GBELL_TKN] = exports.Gbell
memFuncs[c.SIGM_TKN] = exports.Sigm
memFuncs[c.SINGLETON_TKN] = exports.Singleton
memFuncs[c.PIECEWISE_TKN] = exports.Piecewise
memFuncs[c.FUNC_TKN] = exports.Func
exports.MemFuncs = memFuncs

exports.Term = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.Term.prototype)
    that.name = checkType(this, "name", STRING_TYPE, false)
    that.func = checkType(this, "func", exports.MemFunc, false)
    return that
  }
}
exports.Term.typeName = "Term"

exports.FuzzifyBlock = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.FuzzifyBlock.prototype)
    that.var = checkType(this, "var", exports.Var, false)
    that.terms = checkArrayType(this, "terms", exports.Term, false)
    return that
  }
}
exports.FuzzifyBlock.typeName = "FuzzifyBlock"

exports.DefuzzMethod = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.DefuzzMethod.prototype)
    that.method = checkType(this, "method", STRING_TYPE, false)
    return that
  }
}
exports.DefuzzMethod.typeName = "DefuzzMethod"
defuzzMethods = {}
defuzzMethods[c.COG_METHOD_TKN] = new exports.DefuzzMethod({method: c.COG_METHOD_TKN})
defuzzMethods[c.COGS_METHOD_TKN] = new exports.DefuzzMethod({method: c.COGS_METHOD_TKN})
defuzzMethods[c.COA_METHOD_TKN] = new exports.DefuzzMethod({method: c.COA_METHOD_TKN})
defuzzMethods[c.LM_METHOD_TKN] = new exports.DefuzzMethod({method: c.LM_METHOD_TKN})
defuzzMethods[c.RM_METHOD_TKN] = new exports.DefuzzMethod({method: c.RM_METHOD_TKN})
exports.DefuzzMethods = defuzzMethods

exports.DefuzzDefVal = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.DefuzzDefVal.prototype)
    that.isNC = checkType(this, "isNC", BOOL_TYPE, false)
    that.value = checkType(this, "value", NUMBER_TYPE, false)
    return that
  }
}
exports.DefuzzDefVal.typeName = "DefuzzDefVal"

exports.DefuzzRange = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.DefuzzRange.prototype)
    that.min = checkType(this, "min", NUMBER_TYPE, false)
    that.max = checkType(this, "max", NUMBER_TYPE, false)
    return that
  }
}
exports.DefuzzRange.typeName = "DefuzzRange"

exports.DefuzzifyBlock = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
  var that = createObject(exports.DefuzzifyBlock.prototype)
    that.var = checkType(this, "var", exports.Var, false)
    that.terms = checkArrayType(this, "terms", exports.Term, false)
    that.defuzzMethod = checkType(this, "defuzzMethod", exports.DefuzzMethod, false)
    that.defaultVal = checkType(this, "defaultVal", exports.DefuzzDefVal, false)
    that.range = checkType(this, "range", exports.Range, true)
    return that
  }
}
exports.DefuzzifyBlock.typeName = "DefuzzifyBlock"

exports.Operator = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.Operator.prototype)
    that.operator = checkType(this, "operator", STRING_TYPE, false)
    return that
  }
}
exports.Operator.typeName = "Operator"
operators = {}
operators[c.OPERATOR_DEF_AND_TKN] = new exports.Operator({operator: c.OPERATOR_DEF_AND_TKN})
operators[c.OPERATOR_DEF_OR_TKN] = new exports.Operator({operator: c.OPERATOR_DEF_OR_TKN})
exports.Operators = operators

exports.OperatorFunc = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.OperatorFunc.prototype)
    that.func = checkType(this, "func", STRING_TYPE, false)
    return that
  }
}
exports.OperatorFunc.typeName = "OperatorFunc"
operatorFuncs = {}
operatorFuncs[c.AND_METHOD_BDIF_TKN] = new exports.OperatorFunc({func: c.AND_METHOD_BDIF_TKN})
operatorFuncs[c.AND_METHOD_MIN_TKN] = new exports.OperatorFunc({func: c.AND_METHOD_MIN_TKN})
operatorFuncs[c.AND_METHOD_PROF_TKN] = new exports.OperatorFunc({func: c.AND_METHOD_PROF_TKN})
operatorFuncs[c.OR_METHOD_MAX_TKN] = new exports.OperatorFunc({func: c.OR_METHOD_MAX_TKN})
operatorFuncs[c.OR_METHOD_ASUM_TKN] = new exports.OperatorFunc({func: c.OR_METHOD_ASUM_TKN})
operatorFuncs[c.OR_METHOD_BSUM_TKN] = new exports.OperatorFunc({func: c.OR_METHOD_BSUM_TKN})
exports.OperatorFuncs = operatorFuncs

exports.OperatorDef = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.OperatorFunc.prototype)
    that.operator = checkType(this, "operator", exports.Operator, false)
    that.func = checkType(this, "func", exports.OperatorFunc, false)
    return that
  }
}
exports.OperatorDef.typeName = "OperatorDef"

exports.ActivationMethod = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.ActivationMethod.prototype)
    that.method = checkType(this, "method", STRING_TYPE, false)
    return that
  }
}
exports.ActivationMethod.typeName = "ActivationMethod"
activationMethods = {}
activationMethods[c.ACT_METHOD_MIN_TKN] = new exports.ActivationMethod({method: c.ACT_METHOD_MIN_TKN})
activationMethods[c.ACT_METHOD_PROD_TKN] = new exports.ActivationMethod({method: c.ACT_METHOD_PROD_TKN})
exports.ActivationMethods = activationMethods

exports.AccumulationMethod = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.AccumulationMethod.prototype)
    that.method = checkType(this, "method", STRING_TYPE, false)
    return that
  }
}
exports.AccumulationMethod.typeName = "AccumulationMethod"
accumulationMethods = {}
accumulationMethods[c.ACCUM_METHOD_MAX_TKN] = new exports.AccumulationMethod({method: c.ACCUM_METHOD_MAX_TKN})
accumulationMethods[c.ACCUM_METHOD_BSUM_TKN] = new exports.AccumulationMethod({method: c.ACCUM_METHOD_BSUM_TKN})
accumulationMethods[c.ACCUM_METHOD_NSUM_TKN] = new exports.AccumulationMethod({method: c.ACCUM_METHOD_NSUM_TKN})
exports.AccumulationMethods = accumulationMethods

exports.Assertion = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.Assertion.prototype)
    that.var = checkType(this, "var", exports.Var, false)
    that.value = checkExists(this, "val")
    that.not = checkType(this, "not", BOOL_TYPE, true)
    return that
  }
}
exports.Assertion.typeName = "Assertion"

exports.Expression = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.Expression.prototype)
    that.operator = checkType(this, "operator", exports.Operator, false)
    that.firstHalf = checkType(this, "firstHalf", [exports.Assertion, exports.Expression], false)
    that.secondHalf = checkType(this, "secondHalf", [exports.Assertion, exports.Expression], false)
    return that
  }
}
exports.Expression.typeName = "Expression"

exports.WithCond = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.WithCond.prototype)
    that.value = checkType(this, "value", [exports.Var, NUMBER_TYPE], false)
    return that
  }
}
exports.WithCond.typeName = "WithCond"

exports.Rule = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.Rule.prototype)
    that.number = checkType(this, "number", NUMBER_TYPE, false)
    that.ifCond = checkType(this, "ifCond", [exports.Assertion, exports.Expression], false)
    that.thenCond = checkType(this, "thenCond", [exports.Assertion, exports.Expression], false)
    that.withCond = checkType(this, "withCond", exports.WithCond, true)
    return that
  }
}
exports.Rule.typeName = "Rule"

exports.RuleBlock = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.RuleBlock.prototype)
    that.name = checkType(this, "name", STRING_TYPE, false)
    that.andOperatorDef = checkType(this, "operatorDef", exports.OperatorDef, false)
    that.orOperatorDef = checkType(this, "operatorDef", exports.OperatorDef, false)
    that.activationMethod = checkType(this, "activationMethod", exports.ActivationMethod, true)
    that.accumulationMethod = checkType(this, "accumulationMethod", exports.AccumulationMethod, false)
    that.rules = checkArrayType(this, "rules", exports.Rule, false)
    return that
  }
}
exports.RuleBlock.typeName = "RuleBlock"

exports.FunctionBlock = function() {
  BaseObject.apply(this, arguments)

  this.get = function() {
    var that = createObject(exports.FunctionBlock.prototype)
    that.name = checkType(this, "name", STRING_TYPE, false)
    that.varBlocks = checkArrayType(this, "varBlocks", exports.VarBlock, false)
    that.fuzzifyBlocks = checkArrayType(this, "fuzzifyBlocks", exports.FuzzifyBlock, false)
    that.defuzzifyBlocks = checkArrayType(this, "defuzzifyBlocks", exports.DefuzzifyBlock, false)
    that.ruleBlocks = checkArrayType(this, "ruleBlocks", exports.RuleBlock, false)
    return that
  }
}
exports.FunctionBlock.typeName = "FunctionBlock"