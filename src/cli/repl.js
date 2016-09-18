module.exports = REPL;

function REPL() {
  this.quit = false;
  this.tracks = [];
  //this.begin = this.printMenu;
  //this.onInput = function(){};
  this.currentLoop = new MainLoop(this);
}

REPL.prototype.begin = function() {
  this.currentLoop.home();
}

REPL.prototype.onInput = function(line) {
  this.currentLoop.onInput(line);
}

function MainLoop(repl) {
  this.repl = repl;
  this.devs = [];
  this.menu = new NumberedMenu();
}

MainLoop.prototype.home = function() {
  if (this.devs.length === 0) {
    console.log('There are no developers, you must add some for this to be fruitful');
  }
  this.menu
    .clear()
    .item('Add developer(s)', this.beginAddDevLoop, this)
    .item('Solve again', this.solveAgain, this)
    .item('Quit', this.quit, this)
    .defaultCallback(this.wtf, this)
  this.menu.print();
}

MainLoop.prototype.quit = function(line) {
  this.repl.quit = true;
}

MainLoop.prototype.beginAddDevLoop = function(line) {
  console.log('beginAddDevLoop');
}

MainLoop.prototype.solveAgain = function(line) {
  console.log('solve again');
}

MainLoop.prototype.wtf = function(line) {
  console.log('say what?');
}

MainLoop.prototype.onInput = function(line) {
  this.menu.select(line);
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

REPL.prototype.printMenu = function() {
  console.log('1 New track');
  console.log('2 Show');
  console.log('3 New developer');
  console.log('4 Solve');
  console.log('5 Quit');
  this.onInput = this.onSelection;
}

REPL.prototype.onSelection = function(line) {
  if (line === '1') {
    this.createTrack();
  } else if (line === '2') {
    this.quit = true;
  } else {
    console.log('Huh?');
    this.printMenu();
  }
}

REPL.prototype.createTrack = function() {
  this.current = {
    name: null,
    devs: []
  };
  this.tracks.push(this.current);
  console.log('Enter track name');
  this.onInput = this.onTrackName;
}

REPL.prototype.onTrackName = function(line) {
  this.current.name = line;
  console.log('Enter dev name (enter blank line when done)');
  this.onInput = this.onDevName;
}

REPL.prototype.onDevName = function(line) {
  if (line === '') {
    this.printMenu();
    return;
  }
  this.current.devs.push(line);
  console.log('Enter dev name (enter blank line when done)');
  this.onInput = this.onDevName;
}

REPL.prototype.finish = function(line) {
  console.log(JSON.stringify(this.tracks));
}
