exports.Pairist = Pairist;
exports.PairingSolutions = PairingSolutions;
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
  this.pairings = {};
}

PairingSolutions.prototype.add = function(pairing) {
  if (isValid(pairing)) {
    var key = stringifyAndSort(pairing);
    this.pairings[key] = pairing;
  }
}

PairingSolutions.prototype.listValid = function() {
  return Object.keys(this.pairings).map(function(key) {
    return this.pairings[key];
  }, this);
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

function pairingsWithStoryOwners(devs) {
  var groups = makeGroups(devs);
  var pairings = iterPairings(groups.free);
  return combineThem(groups.soloists, pairings);
}

function pairingsWithOnlyStorylessDevs(devs) {
  var groups = makeGroups(devs);
  var storyless_pairings = iterPairings(groups.withoutStory);
  return combineThem(groups.soloists_and_owners, storyless_pairings);
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

  var stories = {};
  var unpairedStoryOwners = 0;
  var unpairedFreeDevs = 0;
  var storylessPairs = 0;
  var freeDevs = 0;

  for(var i = 0; i < pairing.length; ++i) {
    var pair = pairing[i];

    if (!pair || pair.length === 0) {
      console.log('pairing has an falsy value or pair has no devs');
      return false;
    }

    var isSoloist = pair.some(function(dev){return dev.solo});
    if (isSoloist && pair.length > 1) {
      console.log('devs marked as soloists have been paired together');
      return false;
    }

    var hasStory = pair.some(function(dev){return dev.story});
    if (!isSoloist && !hasStory && pair.length === 1) {
      unpairedFreeDevs++;
      if (unpairedFreeDevs > 1) {
        console.log('there are more than one pairs with one dev')
        return false;
      }
    }

    if (hasStory && pair.length === 1) {
      unpairedStoryOwners++;
    }

    if (!hasStory && pair.length > 1) {
      storylessPairs++;
      freeDevs += pair.length;
    }

    var pairStories = Object.keys(pair.reduce(function(accum, dev) {
      if (dev.story) {
        accum[dev.story] = null; // value not used
      }
      return accum;
    }, {}));
    var currentStory = pairStories[0];
    if (!currentStory) {
      continue;
    }

    if (pairStories.length > 1) {
      console.log('devs in same pair have different stories');
      return false;
    }

    if (currentStory in stories) {
      console.log('two pairs have the same story');
      return false;
    }

    stories[currentStory] = null; // value not used
  };

  if (unpairedStoryOwners > 0 && unpairedFreeDevs > 0) {
    console.log('there are unpaired story owners and unpaired free devs');
    return false;
  }

  if (unpairedStoryOwners > 0 && freeDevs > 0) {
    console.log('there are more unpaired story owners than storyless pairs');
    return false;
  }

  return true;
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
