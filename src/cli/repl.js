var Pairist = require('../pairist').Pairist;
var Developer = require('../pairist').Developer;

module.exports = REPL;

function REPL() {
  this.quit = false;
  this.tracks = [];
  this.devs = [];
  this.loopStack = [new MainLoop(this)];
}

REPL.prototype.begin = function() {
  this.loopStack[0].home();
}

REPL.prototype.finish = function(line) {
}

REPL.prototype.onInput = function(line) {
  this.loopStack[0].onInput(line);
}

REPL.prototype.pushLoop = function(loop) {
  this.loopStack.unshift(loop);
  this.loopStack[0].home();
}

REPL.prototype.popLoop = function() {
  this.loopStack.shift();
  this.loopStack[0].home();
}

function MainLoop(repl) {
  this.repl = repl;
  this.menu = new NumberedMenu();
}

function printPairing(pairing) {
  pairing.forEach(function(pair) {
    var pairStr = '\t';
    pairStr += pair.map(function(dev) { return dev.name; }).join(' & ');
    if (pair[0].solo) {
      pairStr += ' (soloing)';
    }
    console.log(pairStr);
  });
}

function printDevs(devs) {
  var devsList = '\t' + devs.map(function(dev) {
    return dev.name;
  }).join(', ');
  console.log(devsList);
}

MainLoop.prototype.home = function() {
  if (this.repl.devs.length === 0) {
    console.log('There are no developers, you must add some for this to be fruitful');
  } else {
    var pairist = new Pairist();
    var pairings = pairist.listPairings(this.repl.devs);
    console.log('Current team')
    printDevs(this.repl.devs);
    console.log('There are', pairings.length, 'solutions. How\'s this?');

    var index = Math.floor(Math.random() * pairings.length);
    printPairing(pairings[index]);
  }
  this.menu
    .clear()
    .item('Add developer(s)', this.beginAddDevLoop, this)
    .item('Toggle solo status of a developer', this.beginSoloistLoop, this)
    .item('Solve again', this.solveAgain, this)
    .item('Quit', this.quit, this)
    .defaultCallback(this.wtf, this)
  this.menu.print();
}

MainLoop.prototype.onInput = function(line) {
  this.menu.select(line);
}

MainLoop.prototype.quit = function(line) {
  this.repl.quit = true;
}

MainLoop.prototype.beginAddDevLoop = function(line) {
  this.repl.pushLoop(new AddDevLoop(this.repl));
}

MainLoop.prototype.beginSoloistLoop = function(line) {
  this.repl.pushLoop(new ToggleSoloistLoop(this.repl));
}

MainLoop.prototype.solveAgain = function(line) {
  console.log('solve again');
  this.home();
}

MainLoop.prototype.wtf = function(line) {
  console.log('say what?');
}

function ToggleSoloistLoop(repl) {
  this.repl = repl;
}

ToggleSoloistLoop.prototype.home = function() {
  console.log('Who?');
}

ToggleSoloistLoop.prototype.onInput = function(input) {
  var dev = this.repl.devs.filter(function(dev) { return dev.name === input })[0];
  if (dev) {
    dev.solo = !dev.solo;
    this.repl.popLoop();
  } else if (input) {
    console.log('I\'m not familiar with', input, 'maybe we should hire them?');
    this.home();
  } else {
    this.repl.popLoop();
  }
}

function AddDevLoop(repl) {
  this.repl = repl;
}

AddDevLoop.prototype.home = function() {
  console.log('Add developers by name, one per line. Enter empty line to finish');
}

AddDevLoop.prototype.onInput = function(input) {
  if (input) {
    this.repl.devs.push(new Developer(input));
  } else {
    this.repl.popLoop();
  }
}

function NumberedMenu() {
  this.clear();
}

NumberedMenu.prototype.clear = function() {
  this.labels = [];
  this.callbacks = [];
  return this;
}

NumberedMenu.prototype.select = function(input) {
  var selection = parseInt(input);
  var cb = this.callbacks[selection];
  if (cb) {
    cb();
  } else {
    this.callDefault();
  }
}

NumberedMenu.prototype.print = function() {
  this.labels.forEach(function(label, index) {
    console.log(index.toString(), label);
  });
}

NumberedMenu.prototype.item = function(label, func, ctx) {
  this.labels.push(label);
  this.callbacks.push(function(){ func.call(ctx) });
  return this;
}

NumberedMenu.prototype.defaultCallback = function(cb, ctx) {
  this.callDefault = function() {
    cb.call(ctx);
  };
  return this;
}
