var obj = require('../objects/objects')

// We are simply extending objects
module.exports = obj

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
  this.__outVarTermValues = {};";

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
      result += v.toString().replace('outVars', 'outVarTerms') + " = [];"
      result += v.toString().replace('outVars', 'outVarTermValues') + " = {};"
    }
  })
  return result
}

obj.Var.prototype.toString = function() {
  switch(this.type) {
    case obj.VarTypes.INPUT:
      return "self.__inVars." + this.name
    case obj.VarTypes.OUTPUT:
      return "self.__outVars." + this.name;
    case obj.VarTypes.LOCAL:
      return "self.__localVars." + this.name;
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

obj.DefuzzifyBlock.prototype.toString = function() {
  self = this
  this.terms.forEach(function(t) {
    result += "this.__outVarTerms." + self.var.name + ".push('" + t.name + "');"
    result += "this.__defuzzTermFunctions." + self.var.name + "." + t.name + " = function() {"
    result += t.func.toString()
    result += "return calc(" + self.var.toString() + ");"
    result += "};"
  })
  result += "this.__defuzzFunctions." + self.var.name + " = function() {"
  result += "if(Object.keys(self.__outVarTermValues." + this.var.name + ").length == 0) {"
  if(self.defaultVal == null || self.defaultVal.isNC) {
    result += "return 0"
  }
  else {
    result += "return " + self.defaultVal.value
  }
  result += "};"

  switch(self.defuzzMethod) {
    case obj.DefuzzMethods.COG:
      result += "sum = 0, weightedSum = 0, step = (max - min) / 1000; \
      for(i = min; i < max; i += step) { \
        vals = []; \
        self.__outVarTerms." + this.var.name + ".forEach(function(t) { \
          vals.push(self.__defuzzTermFunctions." + this.var.name + "[t](i) * self.__outVarTermValues." + this.var.name + "[t]); \
        }); \
        sum += i; \
        weightedSum += Math.max(vals) * result; \
      }; \
      val = weightedSum / sum;"
      break

    case obj.DefuzzMethods.COGS:
      // @TODO
      break

    case obj.DefuzzMethods.COA:
      // @TODO
      break

    case obj.DefuzzMethods.LM:
      // @TODO
      break

    case obj.DefuzzMethods.RM:
      // @TODO
      break
  }

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
  // @TODO
}

obj.Gbell.prototype.toString = function() {
  // @TODO
}

obj.Func.prototype.toString = function() {
  return "return " + t.func.func
}

obj.Piecewise.prototype.toString = function() {
  result = "function calc(x) {"
  xs = "xs = ["
  ys = "ys = ["
  min = this.points[0].x
  max = this.points[0].x
  this.points.forEach(function(point) {
    min = Math.min(min, point.x)
    max = Math.max(min, point.x)
    xs += point.x + ","
    ys += point.y + ","
  })
  result += xs + "];" + ys + "];"
  result += 
    "lo = 0, hi = xs.length - 1; \
    while (hi - lo > 1) { \
      mid = (lo + hi) >> 1; \
      if (x < xs[mid]) hi = mid; \
      else lo = mid; \
    } \
    return ys[lo] + (ys[hi] - ys[lo]) / (xs[hi] - xs[lo]) * (x- xs[lo]) \
  };"
  result += "min = " + min + ";"
  result += "max = " + max + ";"
  return result
}

obj.Sigm.prototype.toString = function() {
  // @TODO
}

obj.Singleton.prototype.toString = function() {
  result = "function calc(x) {"
  result += "if(x == "
  if(typeof this.func.value == 'number') {
    result += this.func.value
  } else {
    result += this.func.value.toString()
  }
  result +=
    ") { \
    return 1 \
  } else { \
    return 0 \
  } \
  };"
  return result
}

obj.Trian.prototype.toString = function() {
  result = "function calc(x) {"
  result += "xs = [" + this.min + "," + this.mid + "," + this.high + "];"
  result += "ys = [0, 1, 0];"
  result += 
    "lo = 0, hi = xs.length - 1; \
    while (hi - lo > 1) { \
      mid = (lo + hi) >> 1; \
      if (x < xs[mid]) hi = mid; \
      else lo = mid; \
    } \
    return ys[lo] + (ys[hi] - ys[lo]) / (xs[hi] - xs[lo]) * (x - xs[lo]) \
  };"
  result += "min = " + this.min + ";"
  result += "max = " + this.max + ";"
  return result
}

obj.Trape.prototype.toString = function() {
  // @TODO
}

obj.RuleBlock.prototype.toString = function() {
  result = ""

  switch(this.andOperatorDef) {
    case obj.OperatorFuncs.PROD:
      result += "function and(one, two) { \
        return one * two \
      }; \
      function or(one, two) { \
        return one + two - one * two \
      };"
      break

    case obj.OperatorFuncs.BDIF:
      result += "function and(one, two) { \
        return Math.max(0, one + two - 1) \
      }; \
      function or(one, two) { \
        return Math.min(1, one + two) \
      };"
      break

    case obj.OperatorFuncs.MIN:
    default:
      result += "function and(one, two) { \
        return Math.min(one, two) \
      }; \
      function or(one, two) { \
        return Math.max(one, two) \
      };"
      break
  }

  switch(this.activationMethod) {
    case obj.ActivationMethods.PROD:
      result += "function act(one, two) { \
        return Math.min(one, two) \
      };"
      break

    case obj.ActivationMethods.MIN:
    default:
      result += "function act(one, two) { \
        return one * two \
      };"
      break
  }

  switch(this.accumulationMethod) {
    case obj.AccumulationMethods.BSUM:
      result += "function acc(one, two) { \
        return Math.min(1, one + two) \
      };"
      break

    case obj.AccumulationMethods.NSUM:
      result += "function acc(one, two) { \
        return (one + two) / Math.max(1, Math.max((1 - one) + (1 - two))) \
      };"
      break

    case obj.AccumulationMethods.MAX:
    default:
      result += "function acc(one, two) { \
        return Math.max(one, two) \
      };"
      break
  }

  this.rules.forEach(function(rule) {
    result += rule.toString()
  })

  result += "for(v in self.__outVars) { \
    this.__outVars[v] = this.__defuzzFunctions[v]() \
  };"

  return result
}

obj.Rule.prototype.toString = function() {
  self = this
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
      " + t + " = acc(" + t + ", res) \
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
  result = ""
  switch(this.operator) {
    case obj.Operators.AND:
      result += "and("
      break

    case obj.Operators.OR:
      result += "or("
      break
  }
  result += this.firstHalf.toString() + ", " + this.secondHalf.toString() + ")"
  return result
}