module.exports = NumberedMenu;

function NumberedMenu() {
  this.clear();
}

NumberedMenu.prototype.clear = function() {
  this.labels = [];
  this.callbacks = [];
  return this;
}

NumberedMenu.prototype.select = function(input) {
  var index = parseInt(input);
  var cb = this.callbacks[index];
  if (cb) {
    cb();
  } else {
    this.callDefault();
  }
}

NumberedMenu.prototype.print = function() {
  this.labels.forEach(function(label, index) {
    console.log(index.toString(), label);
  }, this);
}

NumberedMenu.prototype.item = function(label, func, ctx) {
  if (!func || !func.call) {
    throw new TypeError(func + ' not callable');
  }
  this.labels.push(label);
  this.callbacks.push(function(){ func.call(ctx) });
  return this;
}

NumberedMenu.prototype.defaultCallback = function(func, ctx) {
  if (!func || !func.call) {
    throw new TypeError(func + ' not callable');
  }
  this.callDefault = function() {
    func.call(ctx);
  };
  return this;
}

