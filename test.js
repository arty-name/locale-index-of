var tape = require('tape');
var exported = require('./index');
var localeIndexOf = exported(Intl);

tape('localeIndexOf', function(t) {
  t.plan(10);

  t.test('basic behaviour', function(test) {
    test.plan(6);
    test.equal(localeIndexOf('abcä', 'abcä'), 0, 'same strings');
    test.equal(localeIndexOf('äbc', 'äb'), 0, 'substring at the start of string');
    test.equal(localeIndexOf('abäcd', 'bäc'), 1, 'substring in the middle of string');
    test.equal(localeIndexOf('abcä', 'bcä'), 1, 'substring at the end of string');
    test.equal(localeIndexOf('abcä', 'ä'), 3, 'character at the end of string');
    test.equal(localeIndexOf('äbc', 'bd'), -1, 'no match');
  });

  t.test('sensitivity: base', function(test) {
    test.plan(6);

    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'no match with sensitivity: variant');
    test.equal(localeIndexOf('here is b for you', 'a', 'de', { sensitivity: 'base' }), -1, 'no match with another letter');

    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'base' }), 8, 'ä in the string, a in the substring');
    test.equal(localeIndexOf('here is a for you', 'ä', 'de', { sensitivity: 'base' }), 8, 'a in the string, ä in the substring');

    test.equal(localeIndexOf('here is A for you', 'a', 'de', { sensitivity: 'base' }), 8, 'A in the string, a in the substring');
    test.equal(localeIndexOf('here is a for you', 'A', 'de', { sensitivity: 'base' }), 8, 'a in the string, A in the substring');
  });

  t.test('sensitivity: accent', function(test) {
    test.plan(6);

    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'no match with sensitivity: variant');
    test.equal(localeIndexOf('here is b for you', 'a', 'de', { sensitivity: 'accent' }), -1, 'no match with another letter');

    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'accent' }), -1, 'ä in the string, a in the substring');
    test.equal(localeIndexOf('here is a for you', 'ä', 'de', { sensitivity: 'accent' }), -1, 'a in the string, ä in the substring');

    test.equal(localeIndexOf('here is A for you', 'a', 'de', { sensitivity: 'accent' }), 8, 'A in the string, a in the substring');
    test.equal(localeIndexOf('here is a for you', 'A', 'de', { sensitivity: 'accent' }), 8, 'a in the string, A in the substring');
  });

  t.test('sensitivity: case', function(test) {
    test.plan(6);

    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'no match with sensitivity: variant');
    test.equal(localeIndexOf('here is b for you', 'a', 'de', { sensitivity: 'case' }), -1, 'no match with another letter');

    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'case' }), 8, 'ä in the string, a in the substring');
    test.equal(localeIndexOf('here is a for you', 'ä', 'de', { sensitivity: 'case' }), 8, 'a in the string, ä in the substring');

    test.equal(localeIndexOf('here is A for you', 'a', 'de', { sensitivity: 'case' }), -1, 'A in the string, a in the substring');
    test.equal(localeIndexOf('here is a for you', 'A', 'de', { sensitivity: 'case' }), -1, 'a in the string, A in the substring');
  });

  t.test('sensitivity: variant', function(test) {
    test.plan(6);

    test.equal(localeIndexOf('here is ä for you', 'ä', 'de', { sensitivity: 'variant' }), 8, 'match with same letter');
    test.equal(localeIndexOf('here is b for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'no match with another letter');

    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'ä in the string, a in the substring');
    test.equal(localeIndexOf('here is a for you', 'ä', 'de', { sensitivity: 'variant' }), -1, 'a in the string, ä in the substring');

    test.equal(localeIndexOf('here is A for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'A in the string, a in the substring');
    test.equal(localeIndexOf('here is a for you', 'A', 'de', { sensitivity: 'variant' }), -1, 'a in the string, A in the substring');
  });

  t.test('existing collator', function(test) {
    test.plan(1);
    test.equal(localeIndexOf('here is ä for you', 'a', new Intl.Collator('de', { sensitivity: 'base' })), 8, 'ä in the string, a in the substring');
  });

  t.test('prollyfill mode', function(test) {
    test.plan(2);

    String.prototype.localeIndexOf = exported.prototypeLocaleIndexOf(Intl);

    test.equal('here is ä for you'.localeIndexOf('a', 'de', { sensitivity: 'base' }), 8, 'ä in the string, a in the substring');

    var collator = new Intl.Collator('de', { sensitivity: 'base' });
    test.equal('here is ä for you'.localeIndexOf('a', collator), 8, 'ä in the string, a in the substring');

    delete String.prototype.localeIndexOf;
  });

  t.test('prollyfill installation', function(test) {
    test.plan(1);
    exported.prollyfill();
    test.equal('here is ä for you'.localeIndexOf('a', 'de', { sensitivity: 'base' }), 8, 'ä in the string, a in the substring');
    delete String.prototype.localeIndexOf;
  });

  t.test('ignorePunctuation', function(test) {
    test.plan(4);
    // the caveat is that whitespace is also considered punctuation
    test.equal(localeIndexOf('a mätch, (possibly) true', 'mätchpossibly', 'de', { ignorePunctuation: true }), 1, 'string contains punctuation');
    test.equal(localeIndexOf('a mätchpossibly true', 'mätch possibly!!', 'de', { ignorePunctuation: true }), 1, 'substring contains punctuation');
    test.equal(localeIndexOf('a mätch, (possibly!) true', 'mätch possibly!!', 'de', { ignorePunctuation: true }), 1, 'string and substring contain punctuation');
    test.equal(exported.noPunctuationIndexOf.lastLength, 17, 'lastLength');
  });

  t.test('summator', function(test) {
    test.plan(1);
    test.equal(exported.sum([1,2,3,4]), 10, 'summing an array of numbers');
  });
});
