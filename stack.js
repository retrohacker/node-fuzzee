var stack = module.exports = function constructor() {
  this._stack = []
}

stack.prototype.push = function(obj) {
  this._stack.push(obj)
}

stack.prototype.pop = function() {
  return this._stack.pop()
}

stack.prototype.top = function(obj) {
  return this._stack[this._stack.length - 1]
}

stack.prototype.merge = function(varName) {
  childObj = this._stack.pop()
  if(this.top()[varName] != null) {
    this.top().set(varName, this.top()[varName].concat(childObj))
  }
  else {
    this.top().set(varName, [childObj])
  }
}

module.exports = stack