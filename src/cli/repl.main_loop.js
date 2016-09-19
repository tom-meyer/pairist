var Pairist = require('../pairist').Pairist;
var RC = require('./repl.components');

module.exports = MainLoop;

function MainLoop(repl) {
  this.repl = repl;
  this.menu = new RC.KeyedMenu();
}

MainLoop.prototype.home = function() {
  if (this.repl.devs.length === 0) {
    console.log('There are no developers, you must add some for this to be fruitful');
  } else {
    this.showCurrentStatus();
  }
  this.menu
    .clear()
    .item('r', 'Suggest another pairing', this.solveAgain, this)
    .item('a', 'Assign/unassign story', this.beginLoopFunc(RC.AddLoop), this)
    .item('s', 'Toggle solo status', this.beginLoopFunc(RC.ToggleSoloistLoop), this)
    .item('e', 'Edit developers', this.beginLoopFunc(RC.EditDevLoop), this)
    .item('q', 'Quit', this.quit, this)
    .defaultCallback(this.wtf, this)
  this.menu.print();
}

MainLoop.prototype.onInput = function(line) {
  this.menu.select(line);
}

MainLoop.prototype.quit = function() {
  this.repl.quit = true;
}

MainLoop.prototype.beginLoopFunc = function(Loop) {
  return function() {
    this.repl.pushLoop(new Loop(this.repl));
  }
}

MainLoop.prototype.solveAgain = function() {
  console.log('solve again');
  this.home();
}

MainLoop.prototype.wtf = function() {
  console.log('say what?');
}

MainLoop.prototype.showCurrentStatus = function() {
  var pairist = new Pairist();
  var pairings = pairist.listPairings(this.repl.devs);
  console.log('Current team (' + this.repl.devs.length + ' developers)')
  printDevs(this.repl.devs);
  console.log('There are', pairings.length, 'solutions. How\'s this?');
  var index = Math.floor(Math.random() * pairings.length);
  printPairing(pairings[index]);
}

function printPairing(pairing) {
  console.log()
  pairing.forEach(function(pair) {
    var pairStr = '\t';
    pairStr += pair.map(function(dev) { return dev.name; }).join(' & ');
    if (pair[0].solo) {
      pairStr += ' (soloing)';
    }
    var devHoldingStory = pair.filter(function(dev){ return dev.story })[0];
    if (devHoldingStory) {
      pairStr += ' on ' + devHoldingStory.story;
    }
    console.log(pairStr);
  });
  console.log()
}

function printDevs(devs) {
  var devsList = '\t' + devs.map(function(dev) {
    return dev.name;
  }).join(', ');
  console.log(devsList);
}
