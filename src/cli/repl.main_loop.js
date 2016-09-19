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
    var pairist = new Pairist();
    var pairings = pairist.listPairings(this.repl.devs);
    console.log('Current team (' + this.repl.devs.length + ' developers)')
    printDevs(this.repl.devs);
    console.log('There are', pairings.length, 'solutions. How\'s this?');

    var index = Math.floor(Math.random() * pairings.length);
    printPairing(pairings[index]);
  }
  this.menu
    .clear()
    .item('d', 'Add Developer(s)', this.beginAddDevLoop, this)
    .item('a', 'Assign/unassign story', this.beginAssignStory, this)
    .item('s', 'Toggle solo status of a developer', this.beginSoloistLoop, this)
    .item('r', 'Suggest another pairing', this.solveAgain, this)
    .item('q', 'Quit', this.quit, this)
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
  this.repl.pushLoop(new RC.AddDevLoop(this.repl));
}

MainLoop.prototype.beginAssignStory = function(line) {
  this.repl.pushLoop(new RC.AssignStoryLoop(this.repl));
}

MainLoop.prototype.beginSoloistLoop = function(line) {
  this.repl.pushLoop(new RC.ToggleSoloistLoop(this.repl));
}

MainLoop.prototype.solveAgain = function(line) {
  console.log('solve again');
  this.home();
}

MainLoop.prototype.wtf = function(line) {
  console.log('say what?');
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
