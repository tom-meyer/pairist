exports.Pairist = Pairist;
exports.PairingSolutions = PairingSolutions;
exports.Pair = Pair;
exports.Pairing = Pairing;
exports.Developer = Developer;

function Pairist() {
}

Pairist.prototype.generatePairings = function(devs) {

  var solutions = new PairingSolutions();
  makePairings(devs).forEach(function(pairing) {
    solutions.add(pairing);
  });

  return solutions.listValid();
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
  var paired = [];
  var devsByStory = {};

  devs.forEach(function(dev) {
    if (dev.solo) {
      paired.push(Pair(dev));
    } else if (dev.story) {
      if (dev.story in devsByStory) {
        devsByStory[dev.story].push(dev);
      } else {
        devsByStory[dev.story] = [dev];
      }
    } else {
      free.push(dev);
    }
  });

  Object.keys(devsByStory).forEach(function(story) {
    if (devsByStory[story].length > 1) {
      paired.push(Pair.apply(null, devsByStory[story]));
    } else {
      free.push(devsByStory[story][0]);
    }
  });

  return {
    free: free,
    alreadyPaired: paired
  };
}

function makePairings(devs) {
  var groups = makeGroups(devs);
  var pairings = iterPairings(groups.free);
  //console.log('PAIRINGS:', pairings.length);
  //pairings.forEach(function(pairing) {
  //  console.log('\nPAIRING:', stringifyAndSort(pairing));
  //});
  return combinePairs(groups.alreadyPaired, pairings);
}

function iterPairings(devs) {
  var result = [];
  if (devs.length == 0) {
    // no devs, do nothing
    result.push([]); // TODO avoid this
  } else if (devs.length === 1) {
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
    // even number of devs, so pair up the first dev with everyone else
    var first = devs[0];
    for(var i = 1; i < devs.length; ++i) {
      pairs.push([first, devs[i]]);
    }
    pairs.push([first]); // allow for the possibility of the first dev soloing
  } else {
    // odd number of devs, so make a list of soloists
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
      //console.log('pairing has an falsy value or pair has no devs');
      return false;
    }

    var isSoloist = pair.some(function(dev){return dev.solo});
    if (isSoloist && pair.length > 1) {
      //console.log('devs marked as soloists have been paired together');
      return false;
    }

    var hasStory = pair.some(function(dev){return dev.story});
    if (!isSoloist && !hasStory && pair.length === 1) {
      unpairedFreeDevs++;
      if (unpairedFreeDevs > 1) {
        //console.log('there are more than one pairs with one dev')
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
      //console.log('devs in same pair have different stories');
      return false;
    }

    if (currentStory in stories) {
      //console.log('two pairs have the same story');
      return false;
    }

    stories[currentStory] = null; // value not used
  };

  if (unpairedStoryOwners > 0 && unpairedFreeDevs > 0) {
    //console.log('there are unpaired story owners and unpaired free devs');
    return false;
  }

  if (unpairedStoryOwners > 0 && freeDevs > 0) {
    //console.log('there are more unpaired story owners than storyless pairs');
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

function combinePairs(alreadyPaired, pairings) {
  if (pairings.length == 0) {
    return [alreadyPaired];
  }
  return pairings.map(function(pairing) {
    return alreadyPaired.concat(pairing);
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
