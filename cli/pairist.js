module.exports = Pairist;

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

function iterPairings(devs) {
  var result = [];
  if (devs.length == 2) {
    result.push([devs]);
  } else {
    var dev1 = devs[0];
    for(var i = 1; i < devs.length; ++i) {
      var dev2 = devs[i];
      var remaining = devs.slice(1);
      remaining.splice(i-1, 1);
      iterPairings(remaining).forEach(function(pairings) {
        result.push([[dev1, dev2]].concat(pairings));
      });
    }
  }
  return result;
}

function isValid(pairing) {
  return pairing.every(function(pair) {
    var stories = pair.map(function(dev) {return dev.story}).filter(function(x){return x});
    return stories.length <= 1;
  });
}
