import tape from "tape";
import exported, { noPunctuationIndexOf, prollyfill, prototypeLocaleIndexOf, sum } from "./index.js";

const localeIndexOf = exported(Intl);

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
    test.plan(12);

    const options = {sensitivity: 'base'};

    test.equal(localeIndexOf('here is ä for you', 'a', 'en', { sensitivity: 'variant' }), -1, 'en: no match with sensitivity: variant');
    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'de: no match with sensitivity: variant');

    test.equal(localeIndexOf('here is b for you', 'a', 'en', options), -1, 'en: no match with another letter');
    test.equal(localeIndexOf('here is b for you', 'a', 'de', options), -1, 'de: no match with another letter');

    test.equal(localeIndexOf('here is ä for you', 'a', 'en', options), 8, 'en: ä in the string, a in the substring');
    test.equal(localeIndexOf('here is ä for you', 'a', 'de', options), -1, 'de: ä in the string, a in the substring');

    test.equal(localeIndexOf('here is a for you', 'ä', 'en', options), 8, 'en: a in the string, ä in the substring');
    test.equal(localeIndexOf('here is a for you', 'ä', 'de', options), -1, 'de: a in the string, ä in the substring');

    test.equal(localeIndexOf('here is A for you', 'a', 'en', options), 8, 'en: A in the string, a in the substring');
    test.equal(localeIndexOf('here is A for you', 'a', 'de', options), 8, 'de: A in the string, a in the substring');

    test.equal(localeIndexOf('here is a for you', 'A', 'en', options), 8, 'en: a in the string, A in the substring');
    test.equal(localeIndexOf('here is a for you', 'A', 'de', options), 8, 'de: a in the string, A in the substring');
  });

  t.test('sensitivity: accent', function(test) {
    test.plan(12);

    const options = {sensitivity: 'accent'};

    test.equal(localeIndexOf('here is ä for you', 'a', 'en', { sensitivity: 'variant' }), -1, 'no match with sensitivity: variant');
    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'de: no match with sensitivity: variant');

    test.equal(localeIndexOf('here is b for you', 'a', 'en', options), -1, 'en: no match with another letter');
    test.equal(localeIndexOf('here is b for you', 'a', 'de', options), -1, 'de: no match with another letter');

    test.equal(localeIndexOf('here is ä for you', 'a', 'en', options), -1, 'en: ä in the string, a in the substring');
    test.equal(localeIndexOf('here is ä for you', 'a', 'de', options), -1, 'de: ä in the string, a in the substring');

    test.equal(localeIndexOf('here is a for you', 'ä', 'en', options), -1, 'en: a in the string, ä in the substring');
    test.equal(localeIndexOf('here is a for you', 'ä', 'de', options), -1, 'de: a in the string, ä in the substring');

    test.equal(localeIndexOf('here is A for you', 'a', 'en', options), 8, 'en: A in the string, a in the substring');
    test.equal(localeIndexOf('here is A for you', 'a', 'de', options), 8, 'de: A in the string, a in the substring');

    test.equal(localeIndexOf('here is a for you', 'A', 'en', options), 8, 'en: a in the string, A in the substring');
    test.equal(localeIndexOf('here is a for you', 'A', 'de', options), 8, 'de: a in the string, A in the substring');
  });

  t.test('sensitivity: case', function(test) {
    test.plan(12);

    const options = {sensitivity: 'case'};

    test.equal(localeIndexOf('here is ä for you', 'a', 'en', { sensitivity: 'variant' }), -1, 'no match with sensitivity: variant');
    test.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'no match with sensitivity: variant');

    test.equal(localeIndexOf('here is b for you', 'a', 'en', options), -1, 'en: no match with another letter');
    test.equal(localeIndexOf('here is b for you', 'a', 'de', options), -1, 'de: no match with another letter');

    test.equal(localeIndexOf('here is ä for you', 'a', 'en', options), 8, 'en: ä in the string, a in the substring');
    test.equal(localeIndexOf('here is ä for you', 'a', 'de', options), -1, 'de: ä in the string, a in the substring');

    test.equal(localeIndexOf('here is a for you', 'ä', 'en', options), 8, 'en: a in the string, ä in the substring');
    test.equal(localeIndexOf('here is a for you', 'ä', 'de', options), -1, 'de: a in the string, ä in the substring');

    test.equal(localeIndexOf('here is A for you', 'a', 'en', options), -1, 'en: A in the string, a in the substring');
    test.equal(localeIndexOf('here is A for you', 'a', 'de', options), -1, 'de: A in the string, a in the substring');

    test.equal(localeIndexOf('here is a for you', 'A', 'en', options), -1, 'en: a in the string, A in the substring');
    test.equal(localeIndexOf('here is a for you', 'A', 'de', options), -1, 'de: a in the string, A in the substring');
  });

  t.test('sensitivity: variant', function(test) {
    test.plan(12);

    const options = {sensitivity: 'variant'};

    test.equal(localeIndexOf('here is ä for you', 'ä', 'en', options), 8, 'en: match with same letter');
    test.equal(localeIndexOf('here is ä for you', 'ä', 'de', options), 8, 'de: match with same letter');

    test.equal(localeIndexOf('here is b for you', 'a', 'en', options), -1, 'en: no match with another letter');
    test.equal(localeIndexOf('here is b for you', 'a', 'de', options), -1, 'de: no match with another letter');

    test.equal(localeIndexOf('here is ä for you', 'a', 'en', options), -1, 'en: ä in the string, a in the substring');
    test.equal(localeIndexOf('here is ä for you', 'a', 'de', options), -1, 'de: ä in the string, a in the substring');

    test.equal(localeIndexOf('here is a for you', 'ä', 'en', options), -1, 'en: a in the string, ä in the substring');
    test.equal(localeIndexOf('here is a for you', 'ä', 'de', options), -1, 'de: a in the string, ä in the substring');

    test.equal(localeIndexOf('here is A for you', 'a', 'en', options), -1, 'en: A in the string, a in the substring');
    test.equal(localeIndexOf('here is A for you', 'a', 'de', options), -1, 'de: A in the string, a in the substring');

    test.equal(localeIndexOf('here is a for you', 'A', 'en', options), -1, 'en: a in the string, A in the substring');
    test.equal(localeIndexOf('here is a for you', 'A', 'de', options), -1, 'de: a in the string, A in the substring');
  });

  t.test('existing collator', function(test) {
    test.plan(2);

    const collatorEN = new Intl.Collator('en', {sensitivity: 'base', usage: 'search'});
    test.equal(localeIndexOf('here is ä for you', 'a', collatorEN), 8, 'en: ä in the string, a in the substring');

    const collatorDE = new Intl.Collator('de', {sensitivity: 'base', usage: 'search'});
    test.equal(localeIndexOf('here is ä for you', 'a', collatorDE), -1, 'de: ä in the string, a in the substring');
  });

  t.test('prollyfill mode', function(test) {
    test.plan(4);

    String.prototype.localeIndexOf = prototypeLocaleIndexOf(Intl);

    test.equal('here is ä for you'.localeIndexOf('a', 'en', { sensitivity: 'base' }), 8, 'en: ä in the string, a in the substring');
    test.equal('here is ä for you'.localeIndexOf('a', 'de', { sensitivity: 'base' }), -1, 'de: ä in the string, a in the substring');

    const collatorEN = new Intl.Collator('en', {sensitivity: 'base', usage: 'search'});
    test.equal('here is ä for you'.localeIndexOf('a', collatorEN), 8, 'en: ä in the string, a in the substring');
    const collatorDE = new Intl.Collator('de', {sensitivity: 'base', usage: 'search'});
    test.equal('here is ä for you'.localeIndexOf('a', collatorDE), -1, 'de: ä in the string, a in the substring');

    delete String.prototype.localeIndexOf;
  });

  t.test('prollyfill installation', function(test) {
    test.plan(1);
    prollyfill();
    test.equal('here is ä for you'.localeIndexOf('a', 'en', { sensitivity: 'base' }), 8, 'ä in the string, a in the substring');
    delete String.prototype.localeIndexOf;
  });

  t.test('ignorePunctuation', function(test) {
    test.plan(10);

    const options = {ignorePunctuation: true};

    // the caveat is that whitespace is also considered punctuation
    test.equal(localeIndexOf('tes', 'e', 'en', options), 1, 'en: string contains punctuation');
    test.equal(localeIndexOf('tes', 'e', 'de', options), 1, 'de: string contains punctuation');

    test.equal(localeIndexOf('a mätch, (possibly) true', 'mätchpossibly', 'en', options), 1, 'en: string contains punctuation');
    test.equal(localeIndexOf('a mätch, (possibly) true', 'mätchpossibly', 'de', options), 1, 'de: string contains punctuation');

    test.equal(localeIndexOf('a mätchpossibly true', 'mätch possibly!!', 'en', options), 1, 'en: substring contains punctuation');
    test.equal(localeIndexOf('a mätchpossibly true', 'mätch possibly!!', 'de', options), 1, 'de: substring contains punctuation');

    test.equal(localeIndexOf('a mätch, (possibly!) true', 'mätch possibly!!', 'en', options), 1, 'en: string and substring contain punctuation');
    test.equal(noPunctuationIndexOf.lastLength, 17, 'en: lastLength');

    test.equal(localeIndexOf('a mätch, (possibly!) true', 'mätch possibly!!', 'de', options), 1, 'de: string and substring contain punctuation');
    test.equal(noPunctuationIndexOf.lastLength, 17, 'de: lastLength');
  });

  t.test('summator', function(test) {
    test.plan(1);
    test.equal(sum([1,2,3,4]), 10, 'summing an array of numbers');
  });
});
