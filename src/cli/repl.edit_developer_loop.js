var Developer = require('../pairist').Developer;
var RC = require('./repl.components');

module.exports = EditDevLoop;

function EditDevLoop(repl) {
  this.repl = repl;
  this.menu = new RC.KeyedMenu();
}

EditDevLoop.prototype.home = function() {
  this.menu
    .clear()
    .item('a', 'Add developer', this.beginLoopFunc(AddLoop), this)
    .item('r', 'Rename developer', this.beginLoopFunc(RenameLoop), this)
    .item('d', 'Delete developer', this.beginLoopFunc(DeleteLoop), this)
    .item('b', 'Go back to main menu', this.goBack, this)
    .defaultCallback(this.wtf, this)
    .print();
}

EditDevLoop.prototype.wtf = function() {
  console.log('Huh? Try again.');
}

EditDevLoop.prototype.onInput = function(input) {
  this.menu.select(input);
}

EditDevLoop.prototype.goBack = function(input) {
  this.repl.popLoop();
}

EditDevLoop.prototype.beginLoopFunc = function(Loop) {
  return function() {
    this.repl.pushLoop(new Loop(this.repl));
  }
}

function AddLoop(repl) {
  this.repl = repl;
}

AddLoop.prototype.home = function() {
  console.log('Add developers by name, one per line. Enter empty line to finish');
}

AddLoop.prototype.onInput = function(input) {
  if (input) {
    var suffix = '';
    while(suffix.length < 8) {
      suffix += '0123345679ABCDEF'[Math.floor(Math.random() * 16)];
    }
    this.repl.addDeveloper(new Developer(input+suffix, input));
  } else {
    this.repl.popLoop();
  }
}

function RenameLoop(repl) {
  this.repl = repl;
  this.menu = new RC.NumberedMenu();
}

RenameLoop.prototype.home = function() {
  console.log('Rename developer.. Actually, this is unsupported. LOL')
  this.menu
    .clear()
    .defaultCallback(this.wtf, this);

  this.repl.devs.forEach(function(dev) {
    this.menu.item(dev.name, this.renameFunc(dev.id), this);
  }, this);

  this.menu.print();
}

RenameLoop.prototype.onInput = function(input) {
  if (this.devToRename) {
    this.devToRename.name = input;
    this.repl.save();
    this.repl.popLoop();
  } else {
    this.menu.select(input);
  }
}

RenameLoop.prototype.renameFunc = function(devId) {
  return function() {
    this.devToRename = this.repl.getDevById(devId);
    console.log('Enter name');
  }
}

RenameLoop.prototype.wtf = function() {
  console.log('works');
}

function DeleteLoop(repl) {
  this.repl = repl;
}

DeleteLoop.prototype.home = function() {
  console.log('Who shall be deleted?');
  this.repl.beginTabCompleteForDevNames();
}

DeleteLoop.prototype.onInput = function(input) {
  this.repl.endTabCompletion();
  var dev = this.repl.getDevByName(input);
  if (dev) {
    this.repl.removeDeveloper(dev);
  } else {
    console.log('Who the heck is', input, '?');
  }
  this.repl.popLoop();
}
