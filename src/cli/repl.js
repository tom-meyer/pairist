var fs = require('fs');
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
  this.restoreFromDisk();
  this.loopStack[0].home();
}

REPL.prototype.finish = function(line) {
}

REPL.prototype.onInput = function(line) {
  this.loopStack[0].onInput(line);
}

REPL.prototype.onTabComplete = function(linePartial) {
  if (this.tabCompleteFunc) {
    return this.tabCompleteFunc(linePartial);
  }
  return [[], linePartial];
}

REPL.prototype.endTabCompletion = function(linePartial) {
  this.tabCompleteFunc = null;
}

REPL.prototype.beginTabCompleteForDevNames = function(linePartial) {
  this.tabCompleteFunc = this.tabCompleteDevNames;
}

REPL.prototype.tabCompleteDevNames = function(linePartial) {
  var devNames = this.devs.map(function(dev) {
    return dev.name;
  }).filter(function(name) {
    return name.match('^' + linePartial);
  });
  return [devNames, linePartial];
}

REPL.prototype.beginTabCompleteForStoryNames = function(linePartial) {
  this.tabCompleteFunc = this.tabCompleteStoryNames;
}

REPL.prototype.tabCompleteStoryNames = function(linePartial) {
  var storyNames = this.devs.map(function(dev) {
    return dev.story;
  }).filter(function(story, index, self) {
    return story && self.indexOf(story) === index && story.match('^' + linePartial);
  });
  return [storyNames, linePartial];
}

REPL.prototype.pushLoop = function(loop) {
  this.loopStack.unshift(loop);
  this.loopStack[0].home();
}

REPL.prototype.popLoop = function() {
  this.loopStack.shift();
  this.loopStack[0].home();
}

REPL.prototype.restoreFromDisk = function() {
  try {
    this.devs = JSON.parse(fs.readFileSync('pairist.developers.json', 'utf8'));
  } catch (e) {
    this.devs = [];
  }
}

REPL.prototype.addDeveloper = function(dev) {
  this.devs.push(dev);
  this.save();
}

REPL.prototype.save = function() {
  try {
    fs.writeFileSync('pairist.developers.json', JSON.stringify(this.devs), 'utf8');
  } catch (e) {
    console.warn('failed to save developer');
  }
}

REPL.prototype.getDevByName = function(name) {
  return this.devs.filter(function(dev) { return dev.name === name })[0];
}

function MainLoop(repl) {
  this.repl = repl;
  this.menu = new KeyedMenu();
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
  this.repl.pushLoop(new AddDevLoop(this.repl));
}

MainLoop.prototype.beginAssignStory = function(line) {
  this.repl.pushLoop(new AssignStoryLoop(this.repl));
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

function AssignStoryLoop(repl) {
  this.repl = repl;
  this.target = null;
}

AssignStoryLoop.prototype.home = function() {
  console.log('Who to assign or unassign?');
  this.repl.beginTabCompleteForDevNames();
}

AssignStoryLoop.prototype.onInput = function(input) {
  this.repl.endTabCompletion();
  if (this.target) {
    this.target.story = input || null;
    this.repl.save();
    this.repl.popLoop();
    return;
  }
  var dev = this.repl.getDevByName(input);
  if (dev) {
    console.log('Great, what is the story', dev.name, 'will be on? Enter blank line to unassign.');
    this.target = dev;
    this.repl.beginTabCompleteForStoryNames();
  } else if (input) {
    console.log('I\'m not familiar with', input, 'maybe we should hire them?');
    this.home();
  } else {
    this.repl.popLoop();
  }
}

function ToggleSoloistLoop(repl) {
  this.repl = repl;
}

ToggleSoloistLoop.prototype.home = function() {
  console.log('Who?');
  this.repl.beginTabCompleteForDevNames();
}

ToggleSoloistLoop.prototype.onInput = function(input) {
  this.repl.endTabCompletion();
  var dev = this.repl.getDevByName(input);
  if (dev) {
    dev.solo = !dev.solo;
    this.repl.save();
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
    this.repl.addDeveloper(new Developer(input));
  } else {
    this.repl.popLoop();
  }
}

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
  this.keys.push(key);
  this.labels.push(label);
  this.callbacks.push(function(){ func.call(ctx) });
  return this;
}

KeyedMenu.prototype.defaultCallback = function(cb, ctx) {
  this.callDefault = function() {
    cb.call(ctx);
  };
  return this;
}
