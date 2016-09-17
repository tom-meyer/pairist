module.exports = REPL;

function REPL() {
  this.quit = false;
  this.tracks = [];
  this.begin = this.printMenu;
  //this.currentLoop = new MenuLoop();
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
