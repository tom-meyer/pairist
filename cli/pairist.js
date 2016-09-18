exports.Pairist = Pairist;
exports.Pair = Pair;
exports.Pairing = Pairing;
exports.Developer = Developer;

function Pairist() {
}

Pairist.prototype.generatePairings = function(devs) {
  // Contains valid and invalid pairings
  var all = [].concat(
    pairingsWithStoryOwners(devs),
    pairingsWithOnlyStorylessDevs(devs)
  );

  var solutions = new PairingSolutions();
  all.forEach(function(pairing) {
    solutions.add(pairing);
  });

  var pairings = solutions.listValid();

  return {
    next: function() {
      while (pairings.length) {
        var index = Math.floor(Math.random() * pairings.length);
        return pairings.splice(index, 1)[0];
      }
      return null;
    }
  };
}

function PairingSolutions() {
  this.pairings = [];
}

PairingSolutions.prototype.add = function(pairing) {
  this.pairings.push(pairing);
}

PairingSolutions.prototype.listValid = function() {
  return dedup(this.pairings.filter(isValid));
}

function makeGroups(devs) {
  var free = [];
  var soloists = [];
  var soloists_and_owners = [];
  var withoutStory = [];
  var paired = [];

  devs.forEach(function(dev) {
    if (dev.solo) {
      soloists.push(dev);
      soloists_and_owners.push(dev);
    } else if (dev.story) {
      soloists_and_owners.push(dev);
      free.push(dev);
    } else {
      withoutStory.push(dev);
      free.push(dev);
    }
  });

  return {
    free: free,
    soloists: soloists,
    soloists_and_owners: soloists_and_owners,
    withoutStory: withoutStory,
    paired: paired
  };
}

function pairingsWithOnlyStorylessDevs(devs) {
  var groups = makeGroups(devs);
  var storyless_pairings = iterPairings(groups.withoutStory);
  return combineThem(groups.soloists_and_owners, storyless_pairings);
}

function pairingsWithStoryOwners(devs) {
  var groups = makeGroups(devs);
  var pairings = iterPairings(groups.free);
  return combineThem(groups.soloists, pairings);
}

function iterPairings(devs) {
  var result = [];
  if (devs.length == 0) {
    // no devs, do nothing
  } else if (devs.length <= 2) {
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
  if (!pairing) {
    return false;
  }
  var eachPairHasOneOrZeroStories = pairing.every(function(pair) {
    return uniqueStoryNames(pair).length <= 1;
  });

  /* var accum = {}; */
  /* var allPairsHaveUniqueStories = true; */
  /* pairing.forEach(function(pair) { */
  /*   var sname = uniqueStoryNames(pair)[0]; */
  /*   if (sname && (sname in accum)) { */
  /*     allPairsHaveUniqueStories = false; */
  /*   } else if (sname) { */
  /*     accum[sname] = null; // value doesn't matter */
  /*   } */
  /*   return accum; */
  /* }); */

  return eachPairHasOneOrZeroStories; // && allPairsHaveUniqueStories;
}

function uniqueStoryNames(pair) {
  var names = pair.reduce(function(accum, dev) {
    if (dev.story) {
      accum[dev.story] = null; // value doesn't matter
    }
    return accum;
  }, {});
  return Object.keys(names);
}

function combineThem(soloists, pairings) {
  soloists = soloists.map(function(x) {return Pair(x)});
  if (pairings.length == 0) {
    return [soloists];
  }
  return pairings.map(function(pairing) {
    return soloists.concat(pairing);
  });
}

function dedup(pairings) {
  var hashed = pairings.reduce(function(accum, pairing) {
    accum[stringifyAndSort(pairing)] = pairing;
    return accum;
  }, {});
  return Object.keys(hashed).map(function(key) {
    return hashed[key];
  });
}

function stringifyAndSort(pairing) {
  return '(' + pairing.map(function(pair) {
    return pair.map(function(dev) {
      return dev.name;
    }).sort().join('&');
  }).sort().join(',') + ')';
}

function Developer(name) {
  this.name = name;
  this.story = null;
  this.solo = false;
}

Developer.prototype.setStory = function(story) {
  this.story = story;
  return this;
};

Developer.prototype.isSolo = function(b) {
  this.solo = b;
  return this;
};

// Both of these are syntactic sugar. Just an alias
// for an array literal. Don't use 'new' with these.
function Pair()    { return Array.prototype.slice.call(arguments); }
function Pairing() { return Array.prototype.slice.call(arguments); }
