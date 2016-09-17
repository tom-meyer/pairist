var Pairist = require('./pairist');
var PairsComparison = require('./pairs_comparison')

describe('Pairist', function() {
  var thom;
  var phil;
  var kris;
  var jenn;

  beforeEach(function(){
    thom = developer('Tom');
    phil = developer('Phil');
    kris = developer('Chris');
    jenn = developer('Jenn');

    this.addMatchers({
      toHavePairings: toHavePairings
    });
  });

  describe('when there are 2 devs with no constraints', function() {
    it('creates one pairing', function() {
      var pairist = new Pairist();

      var pairings = pairist.generatePairings([thom, phil]);

      expect(pairings).toHavePairings([Pairing(Pair(thom, phil))]);
    });
  });

  describe('when there are 2 devs with one constraint', function() {
    it('creates no pairs', function() {
      var pairist = new Pairist();
      thom.hasStory('Foo');

      var pairings = pairist.generatePairings([thom, phil]);

      expect(pairings).toHavePairings([Pairing(Pair(thom, phil))]);
    });
  });

  describe('when there are 2 devs with too many constraints', function() {
    it('creates no pairs', function() {
      var pairist = new Pairist();
      thom.hasStory('Foo');
      phil.hasStory('Foo');

      var pairings = pairist.generatePairings([thom, phil]);

      expect(pairings).toHavePairings([]);
    });
  });

  xdescribe('when there are 4 devs', function() {
    it('creates two pairs with constraints', function() {
      var pairist = new Pairist();

      var tom = developer('Tom').hasStory('Foo');
      var phil = developer('Phil');
      var kris = developer('Chris').hasStory('Bar');
      var jenn = developer('Jenn');

      var pairings = pairist.generate([tom, phil, kris, jenn]);

      var all_pairs = pairings.next();
      expect(sortedPairings(pairings)).toEqual([
        ['Chris', 'Phil'], ['Chris', 'Jenn'],
        ['Tom', 'Phil'], ['Chris', 'Jenn'],
      ]);
    });
  });

  function developer(name) {
    var dev = {
      name: name
    };
    dev.hasStory = function(story) {
      dev.story = story;
      return dev;
    };
    return dev
  }

  function pairNames(pairs) {
    return pairs.map(function(pair) {
      return pair.map(function(dev) {
        return dev.name;
      });
    });
  }

  function toHavePairings(expected_pairs) {
    var comparison = new PairsComparison(enumerate(this.actual), expected_pairs.slice());
    this.message = function() {
      var msg = '';
      if (comparison.uniqueToRHS.length) {
        msg += 'Expected pairings to include ' + comparison.uniqueToRHS;
      }
      if (comparison.uniqueToLHS.length) {
        msg += msg && ' and ';
        msg += 'Expected pairings NOT to include ' + comparison.uniqueToLHS;
      }
      return msg;
    }
    return comparison.isEqual;
  }

  function enumerate(pairings) {
    var pair, pairs = [];
    while(pair = pairings.next()) {
      pairs.push(pair);
    }
    return pairs;
  }

  function Pair() { // an alias for an array literal
    return Array.prototype.slice.call(arguments);
  }

  function Pairing() { // an alias for an array literal
    return Array.prototype.slice.call(arguments);
  }
});
