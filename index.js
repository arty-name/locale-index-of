export default function exported(Intl) {
  return function localeIndexOf(string, substring, localesOrCollator, options) {
    return functional(Intl, string, substring, localesOrCollator, options);
  };
}

export function prototypeLocaleIndexOf(Intl) {
  return function prototypeLocaleIndexOf(substring, localesOrCollator, options) {
    return functional(Intl, this, substring, localesOrCollator, options);
  };
}

export function prollyfill() {
  String.prototype.localeIndexOf = (typeof Intl !== 'undefined') ?
    prototypeLocaleIndexOf(Intl) :
    String.prototype.indexOf;
}

export function functional(Intl, string, substring, localesOrCollator, options) {
  const collator = getCollator(Intl, localesOrCollator, options);

  const resolvedOptions = collator.resolvedOptions();
  if (resolvedOptions.ignorePunctuation === false) {
    return indexOf(collator, string, substring);
  }

  const punctuationCollator = new Intl.Collator(resolvedOptions.locale, {ignorePunctuation: true});
  return noPunctuationIndexOf(collator, string, substring, punctuationCollator);
}

export function indexOf(collator, string, substring) {
  const stringLength = string.length;
  const substringLength = substring.length;

  for (let index = 0; index <= stringLength - substringLength; index += 1) {
    const potentialMatch = string.substring(index, index + substringLength);
    if (collator.compare(potentialMatch, substring) === 0) {
      return index;
    }
  }
  return -1;
}

export function noPunctuationIndexOf(collator, string, substring, punctuationCollator) {
  const stringLength = string.length;
  const substringLength = substring.length;

  // a cache for string characters punctuation values
  const characterIsConsidered = new Array(stringLength);

  function isConsidered(character) {
    // concatenation with 'a' is a workaround for Node issue
    return (punctuationCollator.compare('a', 'a' + character) === 0) ? 0 : 1;
  }
  function updateConsideredCharacterAt(index) {
    characterIsConsidered[index] = isConsidered(string[index]);
  }
  function consideredStringCharacters(start, count) {
    return sum(characterIsConsidered.slice(start, start + count));
  }

  let consideredSubstringCharacters = 0;
  let index;

  // count the punctuation characters in the substring, also prefill the initial portion of the cache
  for (index = 0; index < substringLength; index += 1) {
    consideredSubstringCharacters += isConsidered(substring[index]);
    updateConsideredCharacterAt(index);
  }

  for (index = 0; index < stringLength; index += 1) {
    let potentialMatchLength = consideredSubstringCharacters;
    updateConsideredCharacterAt(index + potentialMatchLength);

    // increase the length of the potential match until any of these
    // a) it contains the same amount of considered characters as the substring
    // b) it reaches the end of the string
    while (
      consideredStringCharacters(index, potentialMatchLength) < consideredSubstringCharacters &&
      index + potentialMatchLength <= stringLength
    ) {
      potentialMatchLength += 1;
      updateConsideredCharacterAt(index + potentialMatchLength);
    }

    // now the potential match contains the same amount of considered characters as the substring
    // and they can be compared fairly
    const potentialMatch = string.substring(index, index + potentialMatchLength);
    if (collator.compare(potentialMatch, substring) === 0) {
      noPunctuationIndexOf.lastLength = potentialMatchLength;
      return index;
    }
  }

  return -1;
}

export function sum(list) {
  return list.reduce(function(accumulator, item) {
    return accumulator + item;
  }, 0);
}

export function getCollator(Intl, localesOrCollator, options) {
  if (localesOrCollator && localesOrCollator instanceof Intl.Collator) {
    return localesOrCollator;
  }

  options = getOptions(options);
  return new Intl.Collator(localesOrCollator, options);
}

export function getOptions(options) {
  if (!options) {
    options = {};
  }
  options.usage = 'search';
  return options;
}

