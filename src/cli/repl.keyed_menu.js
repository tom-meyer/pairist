module.exports = KeyedMenu;

function KeyedMenu() {
  this.clear();
}

KeyedMenu.prototype.clear = function() {
  this.keys = [];
  this.labels = [];
  this.callbacks = [];
  return this;
}

KeyedMenu.prototype.select = function(input) {
  var index = this.keys.indexOf(input);
  var cb = this.callbacks[index];
  if (cb) {
    cb();
  } else {
    this.callDefault();
  }
}

KeyedMenu.prototype.print = function() {
  this.labels.forEach(function(label, index) {
    console.log(this.keys[index], label);
  }, this);
}

KeyedMenu.prototype.item = function(key, label, func, ctx) {
  if (!func || !func.call) {
    throw new TypeError(func + ' not callable');
  }
  this.keys.push(key);
  this.labels.push(label);
  this.callbacks.push(function(){ func.call(ctx) });
  return this;
}

KeyedMenu.prototype.defaultCallback = function(func, ctx) {
  if (!func || !func.call) {
    throw new TypeError(func + ' not callable');
  }
  this.callDefault = function() {
    func.call(ctx);
  };
  return this;
}

