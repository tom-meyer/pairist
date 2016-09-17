module.exports = Pairist;

function Pairist() {
}

Pairist.prototype.generatePairings = function(devs) {
  var self = this;
  var done = false;
  return {
    next: function() {
      if (done) return null;
      var solution = self.pairUp(devs);
      done = true;
      return solution.pairs.length ? solution.pairs : null;
    }
  };
}

Pairist.prototype.pairUp = function(devs) {
  var pairs = [];
  var needs_pair = [];
  var message = '';

  devs.forEach(function(dev) {
    if (dev.story) {
      needs_pair.push([dev])
    } else if (needs_pair.length) {
      var pair = needs_pair.shift();
      pair.push(dev);
      pairs.push(pair);
    } else {
      needs_pair.push([dev])
    }
  });

  return {
    pairs: pairs,
    message: needs_pair.length ? 'no solution' : ''
  };
}
