import test from "node:test";
import { strict as assert } from "node:assert";

import exported, { prollyfill, prototypeLocaleIndexOf, indexOf } from "./index.js";

const localeIndexOf = exported(Intl);

test('localeIndexOf', async (t) => {
  await t.test('basic behaviour', () => {
    assert.equal(localeIndexOf('abcä', 'abcä'), 0, 'same strings');
    assert.equal(localeIndexOf('äbc', 'äb'), 0, 'substring at the start of string');
    assert.equal(localeIndexOf('abäcd', 'bäc'), 1, 'substring in the middle of string');
    assert.equal(localeIndexOf('abcä', 'bcä'), 1, 'substring at the end of string');
    assert.equal(localeIndexOf('abcä', 'ä'), 3, 'character at the end of string');
    assert.equal(localeIndexOf('äbc', 'bd'), -1, 'no match');
  });

  await t.test('decomposed strings', () => {
    assert.equal(localeIndexOf('caf\u00e9', 'caf\u0065\u0301'), 0, 'decomposed substring: same strings');
    assert.equal(localeIndexOf('caf\u00e9 x', 'caf\u0065\u0301'), 0, 'decomposed substring: substring at the start of string');
    assert.equal(localeIndexOf('xcaf\u00e9x', 'caf\u0065\u0301'), 1, 'decomposed substring: substring in the middle of string');
    assert.equal(localeIndexOf('xcaf\u00e9', 'caf\u0065\u0301'), 1, 'decomposed substring: substring at the end of string');
    assert.equal(localeIndexOf('cf\u00e9', 'caf\u0065\u0301'), -1, 'decomposed substring: no match');

    assert.equal(localeIndexOf('caf\u0065\u0301', 'caf\u0065\u0301'), 0, 'decomposed both: same strings');
    assert.equal(localeIndexOf('caf\u0065\u0301 x', 'caf\u0065\u0301'), 0, 'decomposed both: substring at the start of string');
    assert.equal(localeIndexOf('xcaf\u0065\u0301x', 'caf\u0065\u0301'), 1, 'decomposed both: substring in the middle of string');
    assert.equal(localeIndexOf('xcaf\u0065\u0301', 'caf\u0065\u0301'), 1, 'decomposed both: substring at the end of string');
    assert.equal(localeIndexOf('cf\u0065\u0301', 'caf\u0065\u0301'), -1, 'decomposed both: no match');

    assert.equal(localeIndexOf('caf\u0065\u0301', 'caf\u00e9'), 0, 'decomposed string: same strings');
    assert.equal(localeIndexOf('caf\u0065\u0301 x', 'caf\u00e9'), 0, 'decomposed string: substring at the start of string');
    assert.equal(localeIndexOf('xcaf\u0065\u0301x', 'caf\u00e9'), 1, 'decomposed string: substring in the middle of string');
    assert.equal(localeIndexOf('xcaf\u0065\u0301', 'caf\u00e9'), 1, 'decomposed string: substring at the end of string');
    assert.equal(localeIndexOf('cf\u0065\u0301', 'caf\u00e9'), -1, 'decomposed string: no match');

    assert.equal(localeIndexOf('\u0065\u0301\u0065\u0301caf\u0065\u0301', 'caf\u00e9'), 4, 'return string index, not grapheme index');
  });

  await t.test('sensitivity: base', () => {
    const options = { sensitivity: 'base' };

    assert.equal(localeIndexOf('here is ä for you', 'a', 'en', { sensitivity: 'variant' }), -1, 'en: no match with sensitivity: variant');
    assert.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'de: no match with sensitivity: variant');

    assert.equal(localeIndexOf('here is b for you', 'a', 'en', options), -1, 'en: no match with another letter');
    assert.equal(localeIndexOf('here is b for you', 'a', 'de', options), -1, 'de: no match with another letter');

    assert.equal(localeIndexOf('here is ä for you', 'a', 'en', options), 8, 'en: ä in the string, a in the substring');
    assert.equal(localeIndexOf('here is ä for you', 'a', 'de', options), -1, 'de: ä in the string, a in the substring');

    assert.equal(localeIndexOf('here is a for you', 'ä', 'en', options), 8, 'en: a in the string, ä in the substring');
    assert.equal(localeIndexOf('here is a for you', 'ä', 'de', options), -1, 'de: a in the string, ä in the substring');

    assert.equal(localeIndexOf('here is A for you', 'a', 'en', options), 8, 'en: A in the string, a in the substring');
    assert.equal(localeIndexOf('here is A for you', 'a', 'de', options), 8, 'de: A in the string, a in the substring');

    assert.equal(localeIndexOf('here is a for you', 'A', 'en', options), 8, 'en: a in the string, A in the substring');
    assert.equal(localeIndexOf('here is a for you', 'A', 'de', options), 8, 'de: a in the string, A in the substring');
  });

  t.test('sensitivity: accent', () => {
    const options = { sensitivity: 'accent' };

    assert.equal(localeIndexOf('here is ä for you', 'a', 'en', { sensitivity: 'variant' }), -1, 'no match with sensitivity: variant');
    assert.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'de: no match with sensitivity: variant');

    assert.equal(localeIndexOf('here is b for you', 'a', 'en', options), -1, 'en: no match with another letter');
    assert.equal(localeIndexOf('here is b for you', 'a', 'de', options), -1, 'de: no match with another letter');

    assert.equal(localeIndexOf('here is ä for you', 'a', 'en', options), -1, 'en: ä in the string, a in the substring');
    assert.equal(localeIndexOf('here is ä for you', 'a', 'de', options), -1, 'de: ä in the string, a in the substring');

    assert.equal(localeIndexOf('here is a for you', 'ä', 'en', options), -1, 'en: a in the string, ä in the substring');
    assert.equal(localeIndexOf('here is a for you', 'ä', 'de', options), -1, 'de: a in the string, ä in the substring');

    assert.equal(localeIndexOf('here is A for you', 'a', 'en', options), 8, 'en: A in the string, a in the substring');
    assert.equal(localeIndexOf('here is A for you', 'a', 'de', options), 8, 'de: A in the string, a in the substring');

    assert.equal(localeIndexOf('here is a for you', 'A', 'en', options), 8, 'en: a in the string, A in the substring');
    assert.equal(localeIndexOf('here is a for you', 'A', 'de', options), 8, 'de: a in the string, A in the substring');
  });

   await t.test('sensitivity: case', () => {
    const options = { sensitivity: 'case' };

    assert.equal(localeIndexOf('here is ä for you', 'a', 'en', { sensitivity: 'variant' }), -1, 'no match with sensitivity: variant');
    assert.equal(localeIndexOf('here is ä for you', 'a', 'de', { sensitivity: 'variant' }), -1, 'no match with sensitivity: variant');

    assert.equal(localeIndexOf('here is b for you', 'a', 'en', options), -1, 'en: no match with another letter');
    assert.equal(localeIndexOf('here is b for you', 'a', 'de', options), -1, 'de: no match with another letter');

    assert.equal(localeIndexOf('here is ä for you', 'a', 'en', options), 8, 'en: ä in the string, a in the substring');
    assert.equal(localeIndexOf('here is ä for you', 'a', 'de', options), -1, 'de: ä in the string, a in the substring');

    assert.equal(localeIndexOf('here is a for you', 'ä', 'en', options), 8, 'en: a in the string, ä in the substring');
    assert.equal(localeIndexOf('here is a for you', 'ä', 'de', options), -1, 'de: a in the string, ä in the substring');

    assert.equal(localeIndexOf('here is A for you', 'a', 'en', options), -1, 'en: A in the string, a in the substring');
    assert.equal(localeIndexOf('here is A for you', 'a', 'de', options), -1, 'de: A in the string, a in the substring');

    assert.equal(localeIndexOf('here is a for you', 'A', 'en', options), -1, 'en: a in the string, A in the substring');
    assert.equal(localeIndexOf('here is a for you', 'A', 'de', options), -1, 'de: a in the string, A in the substring');
  });

  await t.test('sensitivity: variant', () => {
    const options = { sensitivity: 'variant' };

    assert.equal(localeIndexOf('here is ä for you', 'ä', 'en', options), 8, 'en: match with same letter');
    assert.equal(localeIndexOf('here is ä for you', 'ä', 'de', options), 8, 'de: match with same letter');

    assert.equal(localeIndexOf('here is b for you', 'a', 'en', options), -1, 'en: no match with another letter');
    assert.equal(localeIndexOf('here is b for you', 'a', 'de', options), -1, 'de: no match with another letter');

    assert.equal(localeIndexOf('here is ä for you', 'a', 'en', options), -1, 'en: ä in the string, a in the substring');
    assert.equal(localeIndexOf('here is ä for you', 'a', 'de', options), -1, 'de: ä in the string, a in the substring');

    assert.equal(localeIndexOf('here is a for you', 'ä', 'en', options), -1, 'en: a in the string, ä in the substring');
    assert.equal(localeIndexOf('here is a for you', 'ä', 'de', options), -1, 'de: a in the string, ä in the substring');

    assert.equal(localeIndexOf('here is A for you', 'a', 'en', options), -1, 'en: A in the string, a in the substring');
    assert.equal(localeIndexOf('here is A for you', 'a', 'de', options), -1, 'de: A in the string, a in the substring');

    assert.equal(localeIndexOf('here is a for you', 'A', 'en', options), -1, 'en: a in the string, A in the substring');
    assert.equal(localeIndexOf('here is a for you', 'A', 'de', options), -1, 'de: a in the string, A in the substring');
  });

  await t.test('existing collator', () => {
    const collatorEN = new Intl.Collator('en', { sensitivity: 'base', usage: 'search' });
    assert.equal(localeIndexOf('here is ä for you', 'a', collatorEN), 8, 'en: ä in the string, a in the substring');

    const collatorDE = new Intl.Collator('de', { sensitivity: 'base', usage: 'search' });
    assert.equal(localeIndexOf('here is ä for you', 'a', collatorDE), -1, 'de: ä in the string, a in the substring');
  });

  await t.test('prollyfill mode', () => {
    String.prototype.localeIndexOf = prototypeLocaleIndexOf(Intl);

    assert.equal('here is ä for you'.localeIndexOf('a', 'en', { sensitivity: 'base' }), 8, 'en: ä in the string, a in the substring');
    assert.equal('here is ä for you'.localeIndexOf('a', 'de', { sensitivity: 'base' }), -1, 'de: ä in the string, a in the substring');

    const collatorEN = new Intl.Collator('en', { sensitivity: 'base', usage: 'search' });
    assert.equal('here is ä for you'.localeIndexOf('a', collatorEN), 8, 'en: ä in the string, a in the substring');
    const collatorDE = new Intl.Collator('de', { sensitivity: 'base', usage: 'search' });
    assert.equal('here is ä for you'.localeIndexOf('a', collatorDE), -1, 'de: ä in the string, a in the substring');

    delete String.prototype.localeIndexOf;
  });

  await t.test('prollyfill installation', () => {
    prollyfill();
    assert.equal('here is ä for you'.localeIndexOf('a', 'en', { sensitivity: 'base' }), 8, 'ä in the string, a in the substring');
    delete String.prototype.localeIndexOf;
  });

  await t.test('ignorePunctuation', () => {
    const options = { ignorePunctuation: true };

    // the caveat is that whitespace is also considered punctuation
    assert.equal(localeIndexOf('tes', 'e', 'en', options), 1, 'en: string contains punctuation');
    assert.equal(localeIndexOf('tes', 'e', 'de', options), 1, 'de: string contains punctuation');

    assert.equal(localeIndexOf('a mätch, (possibly) true', 'mätchpossibly', 'en', options), 1, 'en: string contains punctuation');
    assert.equal(localeIndexOf('a mätch, (possibly) true', 'mätchpossibly', 'de', options), 1, 'de: string contains punctuation');

    assert.equal(localeIndexOf('a mätchpossibly true', 'mätch possibly!!', 'en', options), 1, 'en: substring contains punctuation');
    assert.equal(localeIndexOf('a mätchpossibly true', 'mätch possibly!!', 'de', options), 1, 'de: substring contains punctuation');

    assert.equal(localeIndexOf('a mätch, (possibly!) true', 'mätch possibly!!', 'en', options), 1, 'en: string and substring contain punctuation');
    assert.equal(indexOf.lastLength, 17, 'en: lastLength');

    assert.equal(localeIndexOf('a mätch, (possibly!) true', 'mätch possibly!!', 'de', options), 1, 'de: string and substring contain punctuation');
    assert.equal(indexOf.lastLength, 17, 'de: lastLength');

    assert.equal(localeIndexOf('\u0065\u0301 mätch, (possibl\u0065\u0301!) true', 'mätch possibl\u00e9!!', 'de', options), 2, 'de: decomposed string and substring contain punctuation');
    assert.equal(indexOf.lastLength, 18, 'de: lastLength');

    assert.equal(localeIndexOf('\u0065\u0301 mätch, (possibl\u00e9!) true', 'mätch possibl\u0065\u0301!!', 'de', options), 2, 'de: string and decomposed substring contain punctuation');
    assert.equal(indexOf.lastLength, 17, 'de: lastLength');
  });
});
