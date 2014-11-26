var c = require("./constants").tokens
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
    types = ""
    typeArray.forEach(function(type) {
      if(types != "") {
        types += ", "
      }
      types += type.typeName
    })
    throw "Object type " + typeof(v) + " does not match required " + types + " in field " + k
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

  d[k].forEach(function(e) {
    if(!validateType(e, type)) {
      throw "Object type " + typeof(v) + " does not match required " + type.typeName + " in field " + k
    }
  })
  return a
}

exports.VarType = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.VarType.prototype)
  that.typeName = "VarType"
  that.type = checkType(d, "type", STRING_TYPE, false)
  return that
}
varTypes = {
  INPUT: exports.VarType({type: "INPUT"}),
  OUTPUT: exports.VarType({type: "OUTPUT"}),
  LOCAL: exports.VarType({type: "LOCAL"})
}
exports.VarTypes = varTypes

exports.VarDataType = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.VarDataType.prototype)
  that.typeName = "VarDataType"
  that.type = checkType(d, "type", STRING_TYPE, false)
  return that
}
varDataTypes = {}
varDataTypes[c.REAL_VAR_TKN] = exports.VarDataType({type: c.REAL_VAR_TKN})
exports.VarDataTypes = varDataTypes

exports.Var = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.Var.prototype)
  that.typeName = "Var"
  that.name = checkType(d, "name", STRING_TYPE, false)
  that.type = checkType(d, "type", exports.VarType, false)
  that.dataType = checkType(d, "dataType", exports.VarDataType, false)
  that.value = checkExists(d, "value")
  return that
}

exports.VarBlock = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.Var.prototype)
  that.typeName = "VarBlock"
  that.vars = checkArrayType(d, "vars", exports.VarType, false)
  return that
}

/**
 * Membership Functions (all fall under MemFunc type)
 */
exports.Point = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.Point.prototype)
  that.typeName = "Point"
  that.x = checkType(d, "x", [exports.Var, NUMBER_TYPE], false)
  that.y = checkType(d, "y", [exports.Var, NUMBER_TYPE], false)
  return that
}

exports.MemFunc = function() {
  var that = createObject(exports.MemFunc.prototype)
  that.typeName = "MemFunc"
  return that
}

exports.Trian = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.MemFunc.prototype)
  that.min = checkType(d, "min", [exports.Var, NUMBER_TYPE], false)
  that.mid = checkType(d, "mid", [exports.Var, NUMBER_TYPE], false)
  that.max = checkType(d, "max", [exports.Var, NUMBER_TYPE], false)
  return that
}

exports.Trape = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.MemFunc.prototype)
  that.min = checkType(d, "min", [exports.Var, NUMBER_TYPE], false)
  that.midLow = checkType(d, "midLow", [exports.Var, NUMBER_TYPE], false)
  that.midHigh = checkType(d, "midHigh", [exports.Var, NUMBER_TYPE], false)
  that.max = checkType(d, "max", [exports.Var, NUMBER_TYPE], false)
  return that
}

exports.Gauss = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.MemFunc.prototype)
  that.mean = checkType(d, "mean", [exports.Var, NUMBER_TYPE], false)
  that.stdev = checkType(d, "stdev", [exports.Var, NUMBER_TYPE], false)
  return that
}

exports.Gbell = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.MemFunc.prototype)
  that.a = checkType(d, "x", [exports.Var, NUMBER_TYPE], false)
  that.b = checkType(d, "b", [exports.Var, NUMBER_TYPE], false)
  that.mean = checkType(d, "mean", [exports.Var, NUMBER_TYPE], false)
  return that
}

exports.Sigm = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.MemFunc.prototype)
  that.gain = checkType(d, "gain", [exports.Var, NUMBER_TYPE], false)
  that.center = checkType(d, "center", [exports.Var, NUMBER_TYPE], false)
  return that
}

exports.Singleton = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.MemFunc.prototype)
  that.value = checkType(d, "value", [exports.Var, NUMBER_TYPE], false)
  return that
}

exports.Piecewise = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.MemFunc.prototype)
  that.points = checkArrayType(d, "points", exports.Point, false)
  return that
}

exports.Func = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.MemFunc.prototype)
  that.func = checkType(d, "func", STRING_TYPE, false)
  return that
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

exports.Term = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.Term.prototype)
  that.typeName = "Term"
  that.name = checkType(d, "name", STRING_TYPE, false)
  that.func = checkType(d, "func", exports.MemFunc, false)
  return that
}

exports.FuzzifyBlock = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.FuzzifyBlock.prototype)
  that.typeName = "FuzzifyBlock"
  that.var = checkType(d, "var", exports.Var, false)
  that.terms = checkArrayType(d, "terms", exports.Term, false)
  return that
}

exports.DefuzzMethod = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.DefuzzMethod.prototype)
  that.typeName = "DefuzzMethod"
  that.method = checkType(d, "method", STRING_TYPE, false)
  return that
}
defuzzMethods = {}
defuzzMethods[c.COG_METHOD_TKN] = exports.DefuzzMethod({method: c.COG_METHOD_TKN})
defuzzMethods[c.COGS_METHOD_TKN] = exports.DefuzzMethod({method: c.COGS_METHOD_TKN})
defuzzMethods[c.COA_METHOD_TKN] = exports.DefuzzMethod({method: c.COA_METHOD_TKN})
defuzzMethods[c.LM_METHOD_TKN] = exports.DefuzzMethod({method: c.LM_METHOD_TKN})
defuzzMethods[c.RM_METHOD_TKN] = exports.DefuzzMethod({method: c.RM_METHOD_TKN})
exports.DefuzzMethods = defuzzMethods

exports.DefuzzDefVal = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.DefuzzDefVal.prototype)
  that.typeName = "DefuzzDefVal"
  that.isNC = checkType(d, "isNC", BOOL_TYPE, false)
  that.value = checkType(d, "value", NUMBER_TYPE, false)
  return that
}

exports.DefuzzRange = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.DefuzzRange.prototype)
  that.typeName = "DefuzzRange"
  that.min = checkType(d, "min", NUMBER_TYPE, false)
  that.max = checkType(d, "max", NUMBER_TYPE, false)
  return that
}

exports.DefuzzifyBlock = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.DefuzzifyBlock.prototype)
  that.typeName = "DefuzzifyBlock"
  that.var = checkType(d, "var", exports.Var, false)
  that.terms = checkArrayType(d, "terms", exports.Term, false)
  that.defuzzMethod = checkType(d, "defuzzMethod", exports.DefuzzMethod, false)
  that.defaultVal = checkType(d, "defaultVal", exports.DefuzzDefVal, false)
  that.range = checkType(d, "range", exports.Range, true)
  return that
}

exports.Operator = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.Operator.prototype)
  that.typeName = "Operator"
  that.operator = checkType(d, "operator", STRING_TYPE, false)
  return that
}
operators = {}
operators[c.OPERATOR_DEF_AND_TKN] = exports.Operator({operator: c.OPERATOR_DEF_AND_TKN})
operators[c.OPERATOR_DEF_OR_TKN] = exports.Operator({operator: c.OPERATOR_DEF_OR_TKN})
exports.Operators = operators

exports.OperatorFunc = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.OperatorFunc.prototype)
  that.typeName = "OperatorFunc"
  that.func = checkType(d, "func", STRING_TYPE, false)
  return that
}
operatorFuncs = {}
operatorFuncs[c.AND_METHOD_BDIF_TKN] = exports.OperatorFunc({func: c.AND_METHOD_BDIF_TKN})
operatorFuncs[c.AND_METHOD_MIN_TKN] = exports.OperatorFunc({func: c.AND_METHOD_MIN_TKN})
operatorFuncs[c.AND_METHOD_PROF_TKN] = exports.OperatorFunc({func: c.AND_METHOD_PROF_TKN})
operatorFuncs[c.OR_METHOD_MAX_TKN] = exports.OperatorFunc({func: c.OR_METHOD_MAX_TKN})
operatorFuncs[c.OR_METHOD_ASUM_TKN] = exports.OperatorFunc({func: c.OR_METHOD_ASUM_TKN})
operatorFuncs[c.OR_METHOD_BSUM_TKN] = exports.OperatorFunc({func: c.OR_METHOD_BSUM_TKN})
exports.OperatorFuncs = operatorFuncs

exports.OperatorDef = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.OperatorFunc.prototype)
  that.typeName = "OperatorDef"
  that.operator = checkType(d, "operator", exports.Operator, false)
  that.func = checkType(d, "func", exports.OperatorFunc, false)
  return that
}

exports.ActivationMethod = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.ActivationMethod.prototype)
  that.typeName = "ActivationMethod"
  that.method = checkType(d, "method", STRING_TYPE, false)
  return that
}
activationMethods = {}
activationMethods[c.ACT_METHOD_MIN_TKN] = exports.ActivationMethod({method: c.ACT_METHOD_MIN_TKN})
activationMethods[c.ACT_METHOD_PROD_TKN] = exports.ActivationMethod({method: c.ACT_METHOD_PROD_TKN})
exports.ActivationMethods = activationMethods

exports.AccumulationMethod = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.AccumulationMethod.prototype)
  that.typeName = "AccumulationMethod"
  that.method = checkType(d, "method", STRING_TYPE, false)
  return that
}
accumulationMethods = {}
accumulationMethods[c.ACCUM_METHOD_MAX_TKN] = exports.AccumulationMethod({method: c.ACCUM_METHOD_MAX_TKN})
accumulationMethods[c.ACCUM_METHOD_BSUM_TKN] = exports.AccumulationMethod({method: c.ACCUM_METHOD_BSUM_TKN})
accumulationMethods[c.ACCUM_METHOD_NSUM_TKN] = exports.AccumulationMethod({method: c.ACCUM_METHOD_NSUM_TKN})
exports.AccumulationMethods = accumulationMethods

exports.Assertion = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.Assertion.prototype)
  that.typeName = "Assertion"
  that.var = checkType(d, "var", exports.Var, false)
  that.value = checkExists(d, "val")
  that.not = checkType(d, "not", BOOL_TYPE, true)
  return that
}

exports.Expression = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.Expression.prototype)
  that.typeName = "Expression"
  that.operator = checkType(d, "operator", exports.Operator, false)
  that.firstHalf = checkType(d, "firstHalf", [exports.Assertion, exports.Expression], false)
  that.secondHalf = checkType(d, "secondHalf", [exports.Assertion, exports.Expression], false)
  return that
}

exports.WithCond = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.WithCond.prototype)
  that.typeName = "WithCond"
  that.value = checkType(d, "value", [exports.Var, NUMBER_TYPE], false)
  return that
}

exports.Rule = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.Rule.prototype)
  that.typeName = "Rule"
  that.ifCond = checkType(d, "ifCond", [exports.Assertion, exports.Expression], false)
  that.thenCond = checkType(d, "thenCond", [exports.Assertion, exports.Expression], false)
  that.withCond = checkType(d, "withCond", exports.WithCond, true)
  return that
}

exports.RuleBlock = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.RuleBlock.prototype)
  that.typeName = "RuleBlock"
  that.name = checkType(d, "name", STRING_TYPE, false)
  that.rules = checkArrayType(d, "rules", exports.Rule, false)
  return that
}

exports.FunctionBlock = function(d) {
  d = (typeof d === "undefined") ? {} : d
  var that = createObject(exports.FunctionBlock.prototype)
  that.typeName = "FunctionBlock"
  that.varBlocks = checkArrayType(d, "varBlocks", exports.VarBlock, false)
  that.fuzzifyBlocks = checkArrayType(d, "fuzzifyBlocks", exports.FuzzifyBlock, false)
  that.defuzzifyBlocks = checkArrayType(d, "defuzzifyBlocks", exports.DefuzzifyBlock, false)
  that.ruleBlocks = checkArrayType(d, "ruleBlocks", exports.RuleBlock, false)
  return that
}