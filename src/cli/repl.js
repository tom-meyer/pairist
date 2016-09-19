var fs = require('fs');
var RC = require('./repl.components');

module.exports.REPL = REPL;

function REPL() {
  this.quit = false;
  this.tracks = [];
  this.devs = [];
  this.loopStack = [new RC.MainLoop(this)];
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
