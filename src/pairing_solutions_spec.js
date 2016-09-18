var PairingSolutions = require('./pairist').PairingSolutions;
var Developer = require('./pairist').Developer;
var Pairing = require('./pairist').Pairing;
var Pair = require('./pairist').Pair;

describe('PairingSolutions', function() {
  var thom;
  var phil;
  var kris;
  var jenn;
  var pete;
  var subject;

  beforeEach(function(){
    thom = new Developer('Tom');
    phil = new Developer('Phil');
    kris = new Developer('Chris');
    jenn = new Developer('Jenn');
    pete = new Developer('Peter');
    subject = new PairingSolutions();
  });

  it('removes duplicates', function() {
    var pairing1 = Pairing(Pair(thom));
    var pairing2 = Pairing(Pair(phil));
    var pairing2_dup = Pairing(Pair(phil));

    subject.add(pairing1);
    subject.add(pairing2);
    subject.add(pairing2_dup);

    expect(subject.listValid()).toEqual([pairing1, pairing2]);
  });

  it('filters out pairings a pair holds multiple stories', function() {
    thom.setStory('Foo');
    phil.setStory('Bar');
    subject.add(Pairing(Pair(thom, phil)));

    expect(subject.listValid()).toEqual([]);
  });

  it('filters out pairings where multiple pairs are holding the same story', function() {
    thom.setStory('Foo');
    phil.setStory('Foo');
    subject.add(Pairing(Pair(thom, jenn), Pair(phil, kris)));

    expect(subject.listValid()).toEqual([]);
  });

  it('filters out pairings where devs are unpaired and are not marked as soloists', function() {
    subject.add(Pairing(Pair(thom), Pair(kris)));

    expect(subject.listValid()).toEqual([]);
  });

  it('accepts pairings where there are soloist that ARE marked as such', function() {
    thom.isSolo(true);
    kris.isSolo(true);

    var pairing = Pairing(Pair(thom), Pair(kris));
    subject.add(pairing);

    expect(subject.listValid()).toEqual([pairing]);
  });

  it('accepts pairings where there are unpaired story owners', function() {
    thom.setStory('Foo');
    kris.setStory('Bar');

    var pairing = Pairing(Pair(thom), Pair(kris));
    subject.add(pairing);

    expect(subject.listValid()).toEqual([pairing]);
  });

  it('filters out pairings where a story owner has not been paired with a free dev', function() {
    thom.setStory('Foo');
    subject.add(Pairing(Pair(thom), Pair(kris)));

    expect(subject.listValid()).toEqual([]);
  });

  it('filters out pairings where soloists have been paired together', function() {
    thom.isSolo(true);
    kris.isSolo(true);
    subject.add(Pairing(Pair(thom, kris)));

    expect(subject.listValid()).toEqual([]);
  });

  it('filters out pairings where free devs should have paired with a story owner', function() {
    thom.setStory('Foo');
    phil.setStory('Foo');
    jenn.setStory('Bar');

    subject.add(Pairing(Pair(thom, phil), Pair(kris), Pair(jenn)));

    expect(subject.listValid()).toEqual([]);
  });

  it('accepts pairings where story owners get paired with free dev', function() {
    thom.setStory('Foo');
    phil.setStory('Foo');
    jenn.setStory('Bar');

    var pairing = Pairing(Pair(thom, phil), Pair(kris, jenn));
    subject.add(pairing);

    expect(subject.listValid()).toEqual([pairing]);
  });

  it('accepts pairings where devs trio', function() {
    thom.setStory('Foo');
    phil.setStory('Foo');
    jenn.setStory('Foo');

    var pairing = Pairing(Pair(thom, phil, jenn), Pair(kris, pete));
    subject.add(pairing);

    expect(subject.listValid()).toEqual([pairing]);
  });
});
