var Pairist = require('./pairist').Pairist;
var Developer = require('./pairist').Developer;
var Pairing = require('./pairist').Pairing;
var Pair = require('./pairist').Pair;
var PairsComparison = require('./pairs_comparison')

describe('Pairist', function() {
  var thom;
  var phil;
  var kris;
  var jenn;
  var pete;

  beforeEach(function(){
    thom = new Developer('Tom');
    phil = new Developer('Phil');
    kris = new Developer('Chris');
    jenn = new Developer('Jenn');
    pete = new Developer('Peter');

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
        thom.setStory('Foo');

        var pairings = pairist.generatePairings([thom, phil]);

        expect(pairings).toHavePairings([
          Pairing(Pair(thom, phil))
        ]);
      });
    });

    describe('when there are 2 devs with differing stories', function() {
      it('creates two solo pairs', function() {
        var pairist = new Pairist();

        thom.setStory('Foo');
        phil.setStory('Bar');

        var pairings = pairist.generatePairings([thom, phil]);

        expect(pairings).toHavePairings([
          Pairing(Pair(thom), Pair(phil)),
        ]);
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
      it('creates two pairs', function() {
        var pairist = new Pairist();

        jenn.setStory('Foo');
        kris.setStory('Bar');

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

    describe('when a dev is marked as solo', function() {
      it('creates one pair and one solo "pair"', function() {
        var pairist = new Pairist();

        thom.isSolo(true);

        var pairings = pairist.generatePairings([phil, thom, jenn]);

        expect(pairings).toHavePairings([
          Pairing(Pair(thom), Pair(jenn, phil))
        ]);
      });
    });

    describe('when all devs are marked as solo', function() {
      it('creates three solo "pairs"', function() {
        var pairist = new Pairist();

        thom.isSolo(true);
        phil.isSolo(true);
        jenn.isSolo(true);

        var pairings = pairist.generatePairings([phil, thom, jenn]);

        expect(pairings).toHavePairings([
          Pairing(Pair(thom), Pair(jenn), Pair(phil))
        ]);
      });
    });

    describe('when 2 devs are on the same story and 2 devs are free', function() {
      it('creates two pairs', function() {
        var pairist = new Pairist();

        thom.setStory('Foo');
        phil.setStory('Foo');
        jenn.setStory('Bar');

        var pairings = pairist.generatePairings([phil, thom, jenn, kris]);

        expect(pairings).toHavePairings([
          Pairing(Pair(thom, phil), Pair(jenn, kris))
        ]);
      });
    });

    /* describe('when 3 devs are on the same story and 2 devs are free', function() { */
    /*   iit('creates two pairs', function() { */
    /*     var pairist = new Pairist(); */

    /*     thom.setStory('Foo'); */
    /*     phil.setStory('Foo'); */
    /*     jenn.setStory('Foo'); */

    /*     var pairings = pairist.generatePairings([phil, thom, jenn, kris, pete]); */

    /*     expect(pairings).toHavePairings([ */
    /*       //Pairing(Pair(thom, phil), Pair(jenn, kris)) */
    /*     ]); */
    /*   }); */
    /* }); */
  });

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
});
