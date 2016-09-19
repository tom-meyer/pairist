module.exports = PairUpLoop;

function PairUpLoop(repl) {
  this.repl = repl;
  this.gettingDevNames = true;
  this.devs = [];
}

PairUpLoop.prototype.home = function() {
  console.log('Enter developers by name, one per line. Enter empty line to finish');
  this.repl.beginTabCompleteForDevNames();
}

PairUpLoop.prototype.onInputName = function(name) {
  var dev = this.repl.getDevByName(name);
  if (!name) {
    console.log('Now, what story? You can enter a new story or tab-complete for an existing one');
    this.gettingDevNames = false;
    this.repl.beginTabCompleteForStoryNames();
  } else if (dev) {
    this.devs.push(dev);
  } else {
    console.log(name + '? ... Who\'s that?');
  }
}

PairUpLoop.prototype.onInputStory = function(story) {
  this.devs.forEach(function(dev) {
    dev.story = story;
  });
  this.repl.save();
  this.repl.endTabCompletion();
  this.repl.popLoop();
}

PairUpLoop.prototype.onInput = function(input) {
  this.gettingDevNames
    ? this.onInputName(input)
    : this.onInputStory(input);
}
