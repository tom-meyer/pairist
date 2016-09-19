var Developer = require('../pairist').Developer;

module.exports = AddDevLoop;

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
