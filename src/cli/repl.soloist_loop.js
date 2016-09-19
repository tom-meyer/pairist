module.exports = ToggleSoloistLoop;

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
