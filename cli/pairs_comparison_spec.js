var PairsComparison = require('./pairs_comparison');

describe('PairsComparison', function() {
  var thom = developer('Tom');
  var phil = developer('Phil');
  var jenn = developer('Jenn');
  var kris = developer('Chris');

  it('equates pairings that are exactly the same', function() {
    var lhs_pairings = [Pairing(Pair(thom, phil))];
    var rhs_pairings = [Pairing(Pair(thom, phil))];

    var subject = new PairsComparison(lhs_pairings, rhs_pairings);

    expect(subject.isEqual).toBe(true);
    expect(subject.uniqueToLHS).toEqual([]);
    expect(subject.uniqueToRHS).toEqual([]);
  });

  it('equates pairings with differing dev order', function() {
    var lhs_pairings = [Pairing(Pair(thom, phil))];
    var rhs_pairings = [Pairing(Pair(phil, thom))];

    var subject = new PairsComparison(lhs_pairings, rhs_pairings)

    expect(new PairsComparison(lhs_pairings, rhs_pairings).isEqual).toBe(true);
    expect(subject.uniqueToLHS).toEqual([]);
    expect(subject.uniqueToRHS).toEqual([]);
  });

  it('equates pairings with differing pair and dev order', function() {
    var lhs_pairings = [Pairing(Pair(jenn, kris), Pair(thom, phil))];
    var rhs_pairings = [Pairing(Pair(phil, thom), Pair(kris, jenn))];

    var subject = new PairsComparison(lhs_pairings, rhs_pairings)

    expect(subject.isEqual).toBe(true);
    expect(subject.uniqueToLHS).toEqual([]);
    expect(subject.uniqueToRHS).toEqual([]);
  });

  it('does not equate pairings that are different', function() {
    var lhs_pairings = [Pairing(Pair(thom, phil))];
    var rhs_pairings = [Pairing(Pair(thom, phil)), Pairing(Pair(thom, phil), Pair(kris, jenn))];

    var subject = new PairsComparison(lhs_pairings, rhs_pairings);

    expect(subject.isEqual).toBe(false);
    expect(subject.uniqueToLHS).toEqual([]);
    expect(subject.uniqueToRHS).toEqual(['(Chris&Jenn,Phil&Tom)']);
  });

  it('equates empty pairings', function() {
    var subject = new PairsComparison([], []);

    expect(subject.isEqual).toBe(true);
    expect(subject.uniqueToLHS).toEqual([]);
    expect(subject.uniqueToRHS).toEqual([]);
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

  function Pair() { // an alias for an array literal
    return Array.prototype.slice.call(arguments);
  }

  function Pairing() { // an alias for an array literal
    return Array.prototype.slice.call(arguments);
  }
});
