module.exports = PairsComparison;

function PairsComparison(lhs_pairings, rhs_pairings) {
  var remaining = symmetric_difference(lhs_pairings, rhs_pairings, isEqualPairing);
  this.isEqual = remaining[0].length === 0 && remaining[1].length === 0;
  this.uniqueToLHS = remaining[0].map(stringifyAndSort);
  this.uniqueToRHS = remaining[1].map(stringifyAndSort);
}

function symmetric_difference(set1, set2, isEqualFunc) {
  var remaining = [];

  while(set1.length) {
    var item1 = set1.shift();
    var index = -1;
    for (var i = 0; i < set2.length && index === -1; i++) {
      var item2 = set2[i];
      if (isEqualFunc(item1, item2)) {
        index = i;
      }
    }
    if (index === -1) {
      remaining.push(item1);
    } else {
      set2.splice(index, 1);
    }
  }

  return [remaining, set2];
}

function isEqualPairing(pairing1, pairing2) {
  return stringifyAndSort(pairing1) === stringifyAndSort(pairing2);
}

function stringifyAndSort(pairing) {
  return '(' + pairing.map(function(pair) {
    return pair.map(function(dev) {
      return dev.id;
    }).sort().join('&');
  }).sort().join(',') + ')';
}
