exports.Pairist = Pairist;
exports.Pair = Pair;
exports.Pairing = Pairing;
exports.Developer = Developer;

function Pairist() {
}

Pairist.prototype.generatePairings = function(devs) {
  var all_pairings = iterPairings(devs);
  return {
    next: function() {
      while (all_pairings.length) {
        var index = Math.floor(Math.random() * all_pairings.length);
        var pairing = all_pairings.splice(index, 1)[0];
        if (isValid(pairing)) {
          return pairing;
        }
      }
      return null;
    }
  };
}

function iterPairings(devs) {
  var result = [];
  if (devs.length <= 2) {
    result.push([devs]);
  } else {
    listSomePairs(devs).forEach(function(pair) {
      var remaining = removeDevs(pair, devs);
      iterPairings(remaining).forEach(function(pairings) {
        result.push([pair].concat(pairings));
      });
    });
  }
  return result;
}

function listSomePairs(devs) {
  var pairs = [];
  if (devs.length % 2 == 0) {
    // pair up the first dev with everyone else
    for(var i = 1; i < devs.length; ++i) {
      pairs.push([devs[0], devs[i]]);
    }
  } else {
    // pick soloists
    for(var i = 0; i < devs.length; ++i) {
      pairs.push([devs[i]]);
    }
  }
  return pairs;
}

function removeDevs(pair, devs) {
  var names_to_remove = pair.reduce(function(accum, dev) {
    accum[dev.name] = null; // value is not used
    return accum;
  }, {});
  return devs.filter(function(dev) {
    return !(dev.name in names_to_remove);
  });
}

function isValid(pairing) {
  return pairing.every(function(pair) {
    var stories = pair.map(function(dev) {return dev.story}).filter(function(x){return x});
    return stories.length <= 1;
  });
}

function Developer(name) {
  this.name = name;
}

Developer.prototype.setStory = function(story) {
  this.story = story;
  return this;
};

// Both of these are syntactic sugar. Just an alias
// for an array literal. Don't use 'new' with these.
function Pair()    { return Array.prototype.slice.call(arguments); }
function Pairing() { return Array.prototype.slice.call(arguments); }
