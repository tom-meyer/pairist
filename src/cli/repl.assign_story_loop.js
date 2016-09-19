module.exports = AssignStoryLoop;

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

