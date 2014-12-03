var obj = require('./objects.js')

// We are simply extending objects
module.exports = obj

obj.FunctionBlock.prototype.toString = function() {
  var result = ""
  result += methodSignature(this)
  result += "{"
  result += variables(this)
  result += fuzzifyBlocks(this)
  result += returnFunc(this)
  result+="}"
  return result
}

function methodSignature(self) {
  var result = "function"
  if(self.name) {
    result += " "+self.name
  }
  result+= "("
  if(self.varBlocks)
    result+= generateVars(self,"INPUT")
  result+= ")"
  return result
}

function variables(self) {
  var result = ""
  if(self.varBlocks) {
    self.varBlocks.forEach(function(v) {
      if(v.vars) {
        v.vars.forEach(function(v) {
          result+="var "+v.toString()+"={"
          if(v.type.type === "INPUT")
            result+="value:"+v.toString()
          result+="};"
        })
      }
    })
  }
  return result
}

function returnFunc(self) {
  var result = "var __output={};"
  if(this.varBlocks) {
    this.varBlocks.forEach(function(v) {
      v.getVarOfType("OUTPUT").forEach(function(v) {
        result+="output."+v+"="+v+";"
      })
    })
  }

  result+="return __output"
  return result
}

function fuzzifyBlocks(self) {
  var result = "__fuzzees={};"
  self.fuzzifyBlocks.forEach(function(v) {
    if(!v.var || !v.var.type || v.var.type.type !== "INPUT") return;
    result+="__fuzzees."+v.var.name+"={}";
    if(!v.var.terms) return;
    v.var.terms.forEach(function(v1) {
      result+="__fuzzees."+v.var.name+"."+v1.name+"="+v1.toString()+";"
    })
  })
  return result
}

function generateVars(self,type) {
  var result = ""
  self.varBlocks.forEach(function(v) {
    var input = v.getVarOfType(type)
    if(input.length === 0) return;
    result+=input.pop()
    input.forEach(function(v) {
      result+=","+v
    })
  })
  return result
}

obj.Term.prototype.toString = function() {
  var result = "function"
  if(this.name)
    result +=" "+this.name
  result+="(__val){"
  result+="/*"+this.func.toString()+"*/"
  result+="}"
  return result;
}

obj.VarBlock.prototype.getVarOfType = function(type) {
  var result = []
  if(this.vars)
    this.vars.forEach(function(v) {
      if(v.type.type === type)
        result.push(v.toString())
    })
  return result

}

obj.Var.prototype.toString = function() {
  return this.name
}

obj.FuzzifyBlock.prototype.toString = function() {
  var result = ""
  if(this.var) {
    result+=""
  }
  return result
}
