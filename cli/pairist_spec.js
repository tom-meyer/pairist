var Pairist = require('./pairist');
var PairsComparison = require('./pairs_comparison')

describe('Pairist', function() {
  var thom;
  var phil;
  var kris;
  var jenn;
  var pete;

  beforeEach(function(){
    thom = developer('Tom');
    phil = developer('Phil');
    kris = developer('Chris');
    jenn = developer('Jenn');
    pete = developer('Peter');

    this.addMatchers({
      toHavePairings: toHavePairings
    });
  });

  describe('generatePairings', function() {
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

    describe('when there are 4 devs with no constraints', function() {
      it('creates many pairs', function() {
        var pairist = new Pairist();

        var pairings = pairist.generatePairings([thom, phil, kris, jenn]);

        expect(pairings).toHavePairings([
          Pairing(Pair(thom, phil), Pair(kris, jenn)),
          Pairing(Pair(thom, kris), Pair(phil, jenn)),
          Pairing(Pair(thom, jenn), Pair(phil, kris)),
        ]);
      });
    });

    describe('when there are 4 devs with some constraints', function() {
      it('creates many pairs', function() {
        var pairist = new Pairist();

        jenn.hasStory('Foo');
        kris.hasStory('Bar');

        var pairings = pairist.generatePairings([thom, phil, kris, jenn]);

        expect(pairings).toHavePairings([
          //Pairing(Pair(thom, phil), Pair(kris, jenn)), both kris and jenn have stories
          Pairing(Pair(thom, kris), Pair(phil, jenn)),
          Pairing(Pair(thom, jenn), Pair(phil, kris)),
        ]);
      });
    });

    describe('when there are an odd number of devs', function() {
      it('creates one pair and one solo', function() {
        var pairist = new Pairist();

        var pairings = pairist.generatePairings([phil, thom, jenn]);

        expect(pairings).toHavePairings([
          Pairing(Pair(jenn), Pair(thom, phil)),
          Pairing(Pair(thom), Pair(jenn, phil)),
          Pairing(Pair(phil), Pair(jenn, thom))
        ]);
      });
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

  function enumerate(iterator) {
    var pairing, pairings = [];
    while(pairing = iterator.next()) {
      pairings.push(pairing);
    }
    return pairings;
  }

  function Pair() { // an alias for an array literal
    return Array.prototype.slice.call(arguments);
  }

  function Pairing() { // an alias for an array literal
    return Array.prototype.slice.call(arguments);
  }
});
