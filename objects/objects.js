var c = require('../constants/tokens').tokens
var STRING_TYPE = 'string',
    NUMBER_TYPE = 'number',
    BOOL_TYPE = 'boolean'

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

function typeNames(typeArray) {
  types = []
  typeArray.forEach(function(type) {
    if(typeof type.typeName == 'undefined') {
      types.push(type)
    }
    else {
      types.push(type.typeName)
    }
  })
  return types.join(', ')
}

function checkExists(d, k) {
  if(d[k] == null) {
    throw 'Object ' + k + ' missing in ' + d.typeName
  }
  else {
    return d[k]
  }
}

function validateType(v, typeArray) {
  foundType = false
  typeArray.forEach(function(type, index) {
    if(typeof(v) === type || (typeof(v) === 'object' && v instanceof type)) {
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
    throw 'Object type ' + typeof(d[k]) + ' does not match required ' + typeNames(typeArray) + ' in field ' + k + ' in ' + d.typeName
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
      throw 'Object type ' + typeof(e) + ' does not match required ' + typeNames(typeArray) + ' in field ' + k
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

  this.validate = function() {
    checkType(this, 'type', STRING_TYPE, false)
  }
}
exports.VarType.prototype.typeName = 'VarType'
varTypes = {
  INPUT: new exports.VarType({type: 'INPUT'}),
  OUTPUT: new exports.VarType({type: 'OUTPUT'}),
  LOCAL: new exports.VarType({type: 'LOCAL'})
}
exports.VarTypes = varTypes

exports.VarDataType = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'type', STRING_TYPE, false)
  }
}
exports.VarDataType.prototype.typeName = 'VarDataType'
varDataTypes = {}
varDataTypes[c.REAL_VAR_TKN] = new exports.VarDataType({type: c.REAL_VAR_TKN})
exports.VarDataTypes = varDataTypes

exports.Var = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'name', STRING_TYPE, false)
    checkType(this, 'type', exports.VarType, false)
    checkType(this, 'dataType', exports.VarDataType, false)
  }
}
exports.Var.prototype.typeName = 'Var'

exports.VarBlock = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkArrayType(this, 'vars', exports.Var, false)
  }
}
exports.VarBlock.prototype.typeName = 'VarBlock'

/**
 * Membership Functions (all fall under MemFunc type)
 */
exports.Point = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'x', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'y', [exports.Var, NUMBER_TYPE], false)
  }
}
exports.Point.prototype.typeName = 'Point'

exports.Trian = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'min', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'mid', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'max', [exports.Var, NUMBER_TYPE], false)
  }
}
exports.Trian.prototype.typeName = 'Trian'

exports.Trape = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'min', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'midLow', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'midHigh', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'max', [exports.Var, NUMBER_TYPE], false)
  }
}
exports.Trape.prototype.typeName = 'Trape'

exports.Gauss = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'mean', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'stdev', [exports.Var, NUMBER_TYPE], false)
  }
}
exports.Gauss.prototype.typeName = 'Gauss'

exports.Gbell = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'x', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'b', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'mean', [exports.Var, NUMBER_TYPE], false)
  }
}
exports.Gbell.prototype.typeName = 'Gbell'

exports.Sigm = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'gain', [exports.Var, NUMBER_TYPE], false)
    checkType(this, 'center', [exports.Var, NUMBER_TYPE], false)
  }
}
exports.Sigm.prototype.typeName = 'Sigm'

exports.Singleton = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'value', [exports.Var, NUMBER_TYPE], false)
  }
}
exports.Singleton.prototype.typeName = 'Singleton'

exports.Piecewise = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkArrayType(this, 'points', exports.Point, false)
  }
}
exports.Piecewise.prototype.typeName = 'Piecewise'

exports.Func = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'func', STRING_TYPE, false)
  }
}
exports.Func.prototype.typeName = 'Func'

exports.Term = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'name', STRING_TYPE, false)
    checkType(this, 'func', [exports.Trian, exports.Trape, exports.Gauss, exports.Gbell, exports.Sigm, exports.Singleton, exports.Piecewise, exports.Func], false)
  }
}
exports.Term.prototype.typeName = 'Term'

exports.FuzzifyBlock = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'var', exports.Var, false)
    checkArrayType(this, 'terms', exports.Term, false)
  }
}
exports.FuzzifyBlock.prototype.typeName = 'FuzzifyBlock'

exports.DefuzzMethod = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'method', STRING_TYPE, false)
  }
}
exports.DefuzzMethod.prototype.typeName = 'DefuzzMethod'
defuzzMethods = {}
defuzzMethods[c.COG_METHOD_TKN] = new exports.DefuzzMethod({method: c.COG_METHOD_TKN})
defuzzMethods[c.COGS_METHOD_TKN] = new exports.DefuzzMethod({method: c.COGS_METHOD_TKN})
defuzzMethods[c.COA_METHOD_TKN] = new exports.DefuzzMethod({method: c.COA_METHOD_TKN})
defuzzMethods[c.LM_METHOD_TKN] = new exports.DefuzzMethod({method: c.LM_METHOD_TKN})
defuzzMethods[c.RM_METHOD_TKN] = new exports.DefuzzMethod({method: c.RM_METHOD_TKN})
exports.DefuzzMethods = defuzzMethods

exports.DefuzzDefVal = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'isNC', BOOL_TYPE, false)
    checkType(this, 'value', NUMBER_TYPE, false)
  }
}
exports.DefuzzDefVal.prototype.typeName = 'DefuzzDefVal'

exports.DefuzzRange = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'min', NUMBER_TYPE, false)
    checkType(this, 'max', NUMBER_TYPE, false)
  }
}
exports.DefuzzRange.prototype.typeName = 'DefuzzRange'

exports.DefuzzifyBlock = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'var', exports.Var, false)
    checkArrayType(this, 'terms', exports.Term, false)
    checkType(this, 'defuzzMethod', exports.DefuzzMethod, false)
    checkType(this, 'defaultVal', exports.DefuzzDefVal, true)
    checkType(this, 'range', exports.Range, true)
  }
}
exports.DefuzzifyBlock.prototype.typeName = 'DefuzzifyBlock'

exports.Operator = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'operator', STRING_TYPE, false)
  }
}
exports.Operator.prototype.typeName = 'Operator'
operators = {}
operators[c.AND_TKN] = new exports.Operator({operator: c.AND_TKN})
operators[c.OR_TKN] = new exports.Operator({operator: c.OR_TKN})
exports.Operators = operators

exports.OperatorFunc = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'func', STRING_TYPE, false)
  }
}
exports.OperatorFunc.prototype.typeName = 'OperatorFunc'
operatorFuncs = {}
operatorFuncs[c.AND_METHOD_BDIF_TKN] = new exports.OperatorFunc({func: c.AND_METHOD_BDIF_TKN})
operatorFuncs[c.MIN_TKN] = new exports.OperatorFunc({func: c.MIN_TKN})
operatorFuncs[c.PROD_TKN] = new exports.OperatorFunc({func: c.PROD_TKN})
operatorFuncs[c.MAX_TKN] = new exports.OperatorFunc({func: c.MAX_TKN})
operatorFuncs[c.OR_METHOD_ASUM_TKN] = new exports.OperatorFunc({func: c.OR_METHOD_ASUM_TKN})
operatorFuncs[c.BSUM_TKN] = new exports.OperatorFunc({func: c.BSUM_TKN})
exports.OperatorFuncs = operatorFuncs

exports.OperatorDef = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'operator', exports.Operator, false)
    checkType(this, 'func', exports.OperatorFunc, false)
  }
}
exports.OperatorDef.prototype.typeName = 'OperatorDef'

exports.ActivationMethod = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'method', STRING_TYPE, false)
  }
}
exports.ActivationMethod.prototype.typeName = 'ActivationMethod'
activationMethods = {}
activationMethods[c.MIN_TKN] = new exports.ActivationMethod({method: c.MIN_TKN})
activationMethods[c.PROD_TKN] = new exports.ActivationMethod({method: c.PROD_TKN})
exports.ActivationMethods = activationMethods

exports.AccumulationMethod = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'method', STRING_TYPE, false)
  }
}
exports.AccumulationMethod.prototype.typeName = 'AccumulationMethod'
accumulationMethods = {}
accumulationMethods[c.MAX_TKN] = new exports.AccumulationMethod({method: c.MAX_TKN})
accumulationMethods[c.BSUM] = new exports.AccumulationMethod({method: c.BSUM})
accumulationMethods[c.ACCUM_METHOD_NSUM_TKN] = new exports.AccumulationMethod({method: c.ACCUM_METHOD_NSUM_TKN})
exports.AccumulationMethods = accumulationMethods

exports.Assertion = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'var', exports.Var, false)
    checkType(this, 'var', exports.Term, false)
    checkType(this, 'not', BOOL_TYPE, true)
  }
}
exports.Assertion.prototype.typeName = 'Assertion'

exports.Expression = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'operator', exports.Operator, false)
    checkType(this, 'firstHalf', [exports.Assertion, exports.Expression], false)
    checkType(this, 'secondHalf', [exports.Assertion, exports.Expression], false)
  }
}
exports.Expression.prototype.typeName = 'Expression'

exports.WithCond = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'value', [exports.Var, NUMBER_TYPE], false)
  }
}
exports.WithCond.prototype.typeName = 'WithCond'

exports.Rule = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'number', NUMBER_TYPE, false)
    checkType(this, 'ifCond', [exports.Assertion, exports.Expression], false)
    checkType(this, 'thenCond', [exports.Assertion, exports.Expression], false)
    checkType(this, 'withCond', exports.WithCond, true)
  }
}
exports.Rule.prototype.typeName = 'Rule'

exports.RuleBlock = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'name', STRING_TYPE, true)
    checkType(this, 'andOperatorDef', exports.OperatorDef, true)
    checkType(this, 'orOperatorDef', exports.OperatorDef, true)
    checkType(this, 'activationMethod', exports.ActivationMethod, true)
    checkType(this, 'accumulationMethod', exports.AccumulationMethod, true)
    checkArrayType(this, 'rules', exports.Rule, false)
  }
}
exports.RuleBlock.prototype.typeName = 'RuleBlock'

exports.FunctionBlock = function() {
  BaseObject.apply(this, arguments)

  this.validate = function() {
    checkType(this, 'name', STRING_TYPE, false)
    checkArrayType(this, 'varBlocks', exports.VarBlock, false)
    checkArrayType(this, 'fuzzifyBlocks', exports.FuzzifyBlock, false)
    checkArrayType(this, 'defuzzifyBlocks', exports.DefuzzifyBlock, true)
    checkArrayType(this, 'ruleBlocks', exports.RuleBlock, true)
  }
}
exports.FunctionBlock.prototype.typeName = 'FunctionBlock'
