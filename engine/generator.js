var obj = require('../objects/objects')

// We are simply extending objects
module.exports = obj

defaults = {
  defaultVal: new obj.DefuzzDefVal({isNC: true}),
  andOperatorDef: new obj.OperatorDef({operator: obj.Operators.AND, func: obj.OperatorFuncs.MIN}),
  orOperatorDef: new obj.OperatorDef({operator: obj.Operators.OR, func: obj.OperatorFuncs.MAX}),
  activationMethod: obj.ActivationMethods.MIN,
  accumulationMethod: obj.AccumulationMethods.MAX
}

function varOrNum(val) {
  if(val instanceof obj.Var) {
    return val.toString()
  }
  else {
    return val
  }
}

function piecewise(xs, ys) {
  xs = xs.map(function(x) {
    return varOrNum(x)
  })
  ys = ys.map(function(y) {
    return varOrNum(y)
  })
  return "xs = [" + xs + "]; \
    ys = [" + ys + "]; \
    min = Math.min.apply(null, xs); \
    max = Math.max.apply(null, xs); \
    calc = function (x) { \
      if(x < min || x > max) { return 0 }; \
      lo = 0, hi = xs.length - 1; \
      while (hi - lo > 1) { \
        mid = (lo + hi) >> 1; \
        if (x < xs[mid]) hi = mid; \
        else lo = mid; \
      } \
      return ys[lo] + (ys[hi] - ys[lo]) / (xs[hi] - xs[lo]) * (x - xs[lo]) \
    };"
}

function singleton(value) {
  return "calc = function (x) { \
    if(x == eval('" + value + "')) { \
      return 1 \
    } else { \
      return 0 \
    } \
    };"
}

function defaultBlocks(name) {
  return "module.exports." + name + ".prototype.get = function(name) { \
    if(typeof this.__inVars[name] != 'undefined') { \
      return this.__inVars[name] \
    } \
    else if(typeof this.__outVars[name] != 'undefined') { \
      return this.__outVars[name] \
    } \
    else if(typeof this.__localVars[name] != 'undefined') { \
      return this.__localVars[name] \
    } \
    else { \
      throw 'Unknown variable ' + name \
    } \
  }; \
  module.exports." + name +".prototype.set = function(name, value) { \
    self = this; \
    if(typeof this.__inVars[name] != 'undefined') { \
      this.__inVars[name] = value; \
      this.__inVarTerms[name].forEach(function(term) { \
        self.__inVarTermValues[name][term] = self.__fuzzFunctions[name][term]() \
      }) \
    } \
    else { \
      throw 'Unknown input variable ' + name \
    } \
  };"
}

var internalArrays = 
  "this.__inVars = {}; \
  this.__outVars = {}; \
  this.__localVars = {}; \
  this.__fuzzFunctions = {}; \
  this.__defuzzFunctions = {}; \
  this.__defuzzTermFunctions = {}; \
  this.__inVarTerms = {}; \
  this.__outVarTerms = {}; \
  this.__inVarTermValues = {}; \
  this.__outVarTermValues = {}; \
  this.__outVarRanges = {}; \
  this.__outDiscreteValues = {};";

obj.FunctionBlock.prototype.toString = function() {
  var result = "module.exports." + this.name + " = function() {"
  result += "self = this;"
  result += internalArrays

  this.varBlocks.forEach(function(block) {
    result += block.toString()
  })

  this.fuzzifyBlocks.forEach(function(block) {
    result += block.toString()
  })

  if(this.defuzzifyBlocks != null) {
    this.defuzzifyBlocks.forEach(function(block) {
      result += block.toString()
    })
  }

  result += "}; "

  result += defaultBlocks(this.name)

  if(this.ruleBlocks != null) {
    result += "module.exports." + this.name +".prototype.evaluate = function() { "
    this.ruleBlocks.forEach(function(block) {
      result += block.toString()
    })
    result += "};"
  }

  return result
}

obj.VarBlock.prototype.toString = function() {
  result = ""
  this.vars.forEach(function(v) {
    result += v.toString() + " = 0;"
    if(v.type == obj.VarTypes.INPUT) {
      result += v.toString().replace('inVars', 'inVarTerms') + " = [];"
      result += v.toString().replace('inVars', 'fuzzFunctions') + " = {};"
      result += v.toString().replace('inVars', 'inVarTermValues') + " = {};"
    }
    else if(v.type == obj.VarTypes.OUTPUT) {
      result += v.toString().replace('outVars', 'defuzzTermFunctions') + " = {};"
      result += v.toString().replace('outVars', 'outVarRanges') + " = {};"
      result += v.toString().replace('outVars', 'outVarTerms') + " = [];"
      result += v.toString().replace('outVars', 'outVarTermValues') + " = {};"
      result += v.toString().replace('outVars', 'outDiscreteValues') + " = {};"
      v.terms.forEach(function(t) {
        if(t.func instanceof obj.Func || t.func instanceof obj.Singleton) {
          result += "if(" + v.toString().replace('outVars', 'outDiscreteValues') + " == null) {"
          result += v.toString().replace('outVars', 'outDiscreteValues') + " = {};"
          result += "};"
          result += v.toString().replace('outVars', 'outDiscreteValues') + "." + t.name + " = "
          if(t.func instanceof obj.Func) {
            result += "'" + t.func.func + "'"
          }
          else {
            result += t.func.value
          }
          result += ";"
        }
      })
    }
  })
  return result
}

obj.Var.prototype.toString = function() {
  switch(this.type) {
    case obj.VarTypes.INPUT:
      return "self.__inVars." + this.name
    case obj.VarTypes.OUTPUT:
      return "self.__outVars." + this.name
    case obj.VarTypes.LOCAL:
      return "self.__localVars." + this.name
  }
}

obj.FuzzifyBlock.prototype.toString = function() {
  self = this
  result = ""
  this.terms.forEach(function(t) {
    result += "this.__inVarTerms." + self.var.name + ".push('" + t.name + "');"
    result += "this.__fuzzFunctions." + self.var.name + "." + t.name + " = function() {"
    result += t.func.toString()
    result += "return calc(" + self.var.toString() + ");"
    result += "};"
  })
  return result
}

obj.DefuzzDefVal.prototype.toString = function() {
  if(this.isNC) {
    return "return 0;"
  }
  else {
    return "return " + this.value + ";"
  }
}

obj.DefuzzMethod.prototype.toString = function(varName) {
  switch(this) {
    case obj.DefuzzMethods.COG:
      return "sum = 0, weightedSum = 0, step = (max - min) / 1000; \
      for(i = self.__outVarRanges." + varName + ".min; i <= self.__outVarRanges." + varName + ".max; i += step) { \
        locVal = 0; \
        self.__outVarTerms." + varName + ".forEach(function(t) { \
          locVal = acc(locVal, self.__defuzzTermFunctions." + varName + "[t](i) * self.__outVarTermValues." + varName + "[t]) \
        }); \
        if(locVal > 0) { \
          sum += locVal; \
          weightedSum += locVal * i \
        }; \
      }; \
      if(sum > 0) { \
        val = weightedSum / sum \
      } else { \
        val = 0 \
      };"

    case obj.DefuzzMethods.COGS:
      return "sum = 0, weightedSum = 0; \
        self.__outVarTerms." + varName + ".forEach(function(t) { \
          sum += eval(self.__outDiscreteValues." + varName + "[t]); \
          weightedSum += eval(self.__outDiscreteValues." + varName + "[t]) * self.__outVarTermValues." + varName + "[t]; \
        }); \
        if(sum > 0) { \
          val = weightedSum / sum \
        } else { \
          val = 0 \
        };"
      break

    case obj.DefuzzMethods.COA:
      return "sumLow = 0, sumHigh = 0, low = 0, high = 0, step = (max - min) / 1000; \
      for(low = min, high = max; low < high) { \
        if(sumLow <= sumHigh) { \
          low += step; \
          locVal = 0; \
          self.__outVarTerms." + varName + ".forEach(function(t) { \
            locVal = acc(locVal, self.__defuzzTermFunctions." + varName + "[t](low) * self.__outVarTermValues." + varName + "[t]) \
          }); \
          sumLow += locVal \
        } else { \
          high -= step; \
          locVal = 0; \
          self.__outVarTerms." + varName + ".forEach(function(t) { \
            locVal = acc(locVal, self.__defuzzTermFunctions." + varName + "[t](high) * self.__outVarTermValues." + varName + "[t]) \
          }); \
          sumHigh += locVal \
        } \
      } \
      val = min + low;"

    case obj.DefuzzMethods.LM:
      return "max = 0, val = 0, last = 0, step = (max - min) / 1000; \
      for(i = self.__outVarRanges." + varName + ".min; i <= self.__outVarRanges." + varName + ".max; i += step) { \
        locVal = 0; \
        self.__outVarTerms." + varName + ".forEach(function(t) { \
          locVal = acc(locVal, self.__defuzzTermFunctions." + varName + "[t](i) * self.__outVarTermValues." + varName + "[t]) \
        }); \
        if(locVal > max) { \
          max = locVal; \
          val = i \
        } \
        else if(locVal < last) { \
          break \
        } else { \
          last = locVal \
        } \
      };"

    case obj.DefuzzMethods.RM:
      return "max = 0, val = 0, last = 0, step = (max - min) / 1000; \
      for(i = self.__outVarRanges." + varName + ".max; i >= self.__outVarRanges." + varName + ".max; i -= step) { \
        locVal = 0; \
        self.__outVarTerms." + varName + ".forEach(function(t) { \
          locVal = acc(locVal, self.__defuzzTermFunctions." + varName + "[t](i) * self.__outVarTermValues." + varName + "[t]) \
        }); \
        if(locVal > max) { \
          max = locVal; \
          val = i \
        } \
        else if(locVal < last) { \
          break \
        } else { \
          last = locVal \
        } \
      };"
  }
}

obj.DefuzzifyBlock.prototype.toString = function() {
  self = this
  this.terms.forEach(function(t) {
    result += "this.__outVarTerms." + self.var.name + ".push('" + t.name + "');"
    result += "this.__defuzzTermFunctions." + self.var.name + "." + t.name + " = function(x) {"
    result += t.func.toString()
    result += "if(self.__outVarRanges." + self.var.name + ".min != null) { \
      self.__outVarRanges." + self.var.name + ".min = Math.min(min, self.__outVarRanges." + self.var.name + ".min); \
    } else { \
       self.__outVarRanges." + self.var.name + ".min = min \
    }; \
    if(self.__outVarRanges." + self.var.name + ".max != null) { \
      self.__outVarRanges." + self.var.name + ".max = Math.max(max, self.__outVarRanges." + self.var.name + ".max) \
    } else { \
       self.__outVarRanges." + self.var.name + ".max = max \
    };"
    result += "return calc(x);"
    result += "};"
    // Exercise each function once to set the range
    result += "this.__defuzzTermFunctions." + self.var.name + "." + t.name + "(0);"
  })
  result += "this.__defuzzFunctions." + self.var.name + " = function(acc) {"

  result += "if(Object.keys(self.__outVarTermValues." + this.var.name + ").length == 0) {"
  if(this.defaultVal) {
    result += this.defaultVal.toString()
  }
  else {
    result += defaults.defaultVal.toString()
  }
  result += "};"

  result += this.defuzzMethod.toString(this.var.name)

  if(self.range) {
    result += "if(val < " + self.range.min + ") { \
      return " + self.range.min + " \
    } else if(val > " + self.range.max + ") { \
      return " + self.range.max + " \
    } else { \
      return val \
    }"
  }
  else {
    result += "return val"
  }

  result += "};"
  return result
}

obj.Gauss.prototype.toString = function() {
  result = "calc = function (x) { \
    m = " + varOrNum(this.stdev) + " * Math.sqrt(2 * Math.PI); \
    e = Math.exp(-Math.pow(x - " + varOrNum(this.mean) + ", 2) / (2 * Math.pow(" + varOrNum(this.stdev) + ", 2))); \
    return e / m; \
  }; \
  min = " + varOrNum(this.mean) + " - 4.0 * " + varOrNum(this.stdev) + "; \
  max = " + varOrNum(this.mean) + " + 4.0 * " + varOrNum(this.stdev) + ";"
  return result
}

obj.Gbell.prototype.toString = function() {
  return "delta = Math.pow(999, 1 / (2 * " + varOrNum(this.mean) + ")) * " + varOrNum(this.b) + "; \
  min = " + varOrNum(this.a) + " - delta; \
  max = " + varOrNum(this.a) + " + delta; \
  calc = function (x) { \
    if(x < min || x > max) { return 0 }; \
    t = Math.abs((x - " + varOrNum(this.mean) +") / " + varOrNum(this.a) + "); \
    t = Math.pow(t, 2.0 * " + varOrNum(this.b) + "); \
    return 1 / (1 + t) \
  };"
}

obj.Func.prototype.toString = function() {
  return singleton(this.func)
}

obj.Piecewise.prototype.toString = function() {
  xs = []
  ys = []
  this.points.forEach(function(point) {
    xs.push(point.x)
    ys.push(point.y)
  })
  return piecewise(xs, ys)
}

obj.Sigm.prototype.toString = function() {
  return "min = " + varOrNum(this.center) + " - 9 / Math.abs(" + varOrNum(this.gain) + "); \
    max = " + varOrNum(this.center) + " + 9 / Math.abs(" + varOrNum(this.gain) + "); \
    calc = function (x) { \
      if(x < min || x > max) { return 0; } \
      return 1.0 / (1.0 + Math.exp(-" + varOrNum(this.gain) + " * (x - " + varOrNum(this.center) + "))); \
    };"
}

obj.Singleton.prototype.toString = function() {
  return singleton(varOrNum(this.value))
}

obj.Trian.prototype.toString = function() {
  return piecewise([this.min, this.mid, this.max], [0, 1, 0])
}

obj.Trape.prototype.toString = function() {
  return piecewise([this.min, this.midLow, this.midHigh, this.max], [0, 1, 1, 0])
}

obj.Operator.prototype.toString = function() {
  return this.operator.toLowerCase()
}

obj.OperatorFunc.prototype.toString = function() {
  switch(this) {
    case obj.OperatorFuncs.PROD:
      return "return one * two"

    case obj.OperatorFuncs.ASUM:
      return "return one + two - one * two"

    case obj.OperatorFuncs.BDIF: 
      return "return Math.max(0, one + two - 1)"

    case obj.OperatorFuncs.BSUM:
      return "return Math.min(1, one + two)"

    case obj.OperatorFuncs.MIN:
      return "return Math.min(one, two)"

    case obj.OperatorFuncs.MAX:
      return "return Math.max(one, two)"
  }
}

obj.OperatorDef.prototype.toString = function() {
  result = ""
  result += this.operator.toString() + " = function(one, two) {"
  result += this.func.toString()
  result += "};"
  return result
}

obj.ActivationMethod.prototype.toString = function() {
  result = ""
  result += "act = function(one, two) {"
  switch(this) {
    case obj.ActivationMethods.MIN:
      result += "return Math.min(one, two)"
      break

    case obj.ActivationMethods.PROD:
      result += "return one * two"
      break
  }
  result += "};"
  return result
}

obj.AccumulationMethod.prototype.toString = function() {
  result = ""
  result += "acc = function(one, two) {"
  switch(this) {
    case obj.AccumulationMethods.BSUM:
      result += "return Math.min(1, one + two)"
      break

    case obj.AccumulationMethods.NSUM:
      result += "return (one + two) / Math.max(1, Math.max((1 - one) + (1 - two)))"
      break

    case obj.AccumulationMethods.MAX:
      result += "return Math.max(one, two)"
      break
  }
  result += "};"
  return result
}

obj.RuleBlock.prototype.toString = function() {
  result = ""

  if(this.andOperatorDef && this.orOperatorDef) {
    result += this.andOperatorDef.toString()
    result += this.orOperatorDef.toString()
  }
  else {
    result += defaults.andOperatorDef.toString()
    result += defaults.orOperatorDef.toString()
  }

  if(this.activationMethod) {
    result += this.activationMethod.toString()
  }
  else {
    result += defaults.activationMethod.toString()
  }
  if(this.accumulationMethod) {
    result += this.accumulationMethod.toString()
  }
  else {
    result += defaults.accumulationMethod.toString()
  }

  this.rules.forEach(function(rule) {
    result += rule.toString()
  })

  result += "for(v in self.__outVars) { \
    this.__outVars[v] = this.__defuzzFunctions[v](acc) \
  };"

  return result
}

obj.Rule.prototype.toString = function() {
  self = this
  result = ""
  result += "degreeOfSupport = " + this.ifCond.toString() + ";"
  this.thenCond.forEach(function(then) {
    t = "self.__outVarTermValues." + then.var.name + "." + then.term.name
    result += "res = "
    if(then.not) {
      result += "1 - "
    }
    result += "degreeOfSupport"
    if(self.withCond) {
      result += " * "
      if(typeof self.withCond.value == 'number') {
        result += self.withCond.value
      } else {
        result += self.withCond.value.toString()
      }
    }
    result += ";"
    result += "if(" + t + ") { \
      " + t + " = act(" + t + ", res) \
    } else { \
      " + t + " = res \
    };"
  })
  return result
}

obj.Assertion.prototype.toString = function() {
  result = ""
  if(this.not) {
    result += "1 - "
  }
  result += "self.__inVarTermValues." + this.var.name + "." + this.term.name
  return result
}

obj.Expression.prototype.toString = function() {
  return this.operator.toString() + "(" + this.firstHalf.toString() + ", " + this.secondHalf.toString() + ")"
}