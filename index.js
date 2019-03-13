function exported(Intl) {
  return function localeIndexOf(string, substring, localesOrCollator, options) {
    return exported.functional(Intl, string, substring, localesOrCollator, options);
  };
}

exported.prototypeLocaleIndexOf = function(Intl) {
  return function prototypeLocaleIndexOf(substring, localesOrCollator, options) {
    return exported.functional(Intl, this, substring, localesOrCollator, options);
  };
};

exported.prollyfill = function() {
  String.prototype.localeIndexOf = (typeof Intl !== 'undefined') ?
    exported.prototypeLocaleIndexOf(Intl) :
    String.prototype.indexOf;
};

exported.functional = function(Intl, string, substring, localesOrCollator, options) {
  var collator = exported.getCollator(Intl, localesOrCollator, options);

  var resolvedOptions = collator.resolvedOptions();
  if (resolvedOptions.ignorePunctuation === false) {
    return exported.indexOf(collator, string, substring);
  }

  var punctuationCollator = new Intl.Collator(resolvedOptions.locale, { ignorePunctuation: true });
  return exported.noPunctuationIndexOf(collator, string, substring, punctuationCollator);
};

exported.indexOf = function(collator, string, substring) {
  var stringLength = string.length;
  var substringLength = substring.length;

  for (var index = 0; index <= stringLength - substringLength; index += 1) {
    var potentialMatch = string.substring(index, index + substringLength);
    if (collator.compare(potentialMatch, substring) === 0) {
      return index;
    }
  }
  return -1;
};

exported.noPunctuationIndexOf = function(collator, string, substring, punctuationCollator) {
  var stringLength = string.length;
  var substringLength = substring.length;

  // a cache for string characters punctuation values
  var characterIsConsidered = new Array(stringLength);
  function isConsidered(character) {
    return (punctuationCollator.compare('', character) === 0) ? 0 : 1;
  }
  function updateConsideredCharacterAt(index) {
    characterIsConsidered[index] = isConsidered(string[index]);
  }
  function consideredStringCharacters(start, count) {
    return exported.sum(characterIsConsidered.slice(start, start + count));
  }

  var consideredSubstringCharacters = 0;
  var index;

  // count the punctuation characters in the substring, also prefill the initial portion of the cache
  for (index = 0; index < substringLength; index += 1) {
    consideredSubstringCharacters += isConsidered(substring[index]);
    updateConsideredCharacterAt(index);
  }

  for (index = 0; index < stringLength; index += 1) {
    var potentialMatchLength = consideredSubstringCharacters;

    // increase the length of the potential match until any of these
    // a) it contains the same amount of considered characters as the substring
    // b) it reaches the end of the string
    while (
      consideredStringCharacters(index, potentialMatchLength) < consideredSubstringCharacters &&
      index + potentialMatchLength <= stringLength
    ) {
      updateConsideredCharacterAt(index + potentialMatchLength);
      potentialMatchLength += 1;
    }

    // now the potential match contains the same amount of considered characters as the substring
    // and they can be compared fairly
    var potentialMatch = string.substring(index, index + potentialMatchLength);
    if (collator.compare(potentialMatch, substring) === 0) {
      exported.noPunctuationIndexOf.lastLength = potentialMatchLength;
      return index;
    }
  }

  return -1;
};

exported.sum = function(list) {
  return list.reduce(function(accumulator, item) {
    return accumulator + item;
  }, 0);
};

exported.getCollator = function(Intl, localesOrCollator, options) {
  if (localesOrCollator && localesOrCollator instanceof Intl.Collator) {
    return localesOrCollator;
  }

  options = exported.getOptions(options);
  return new Intl.Collator(localesOrCollator, options);
};

exported.getOptions = function(options) {
  if (!options) {
    options = {};
  }
  options.usage = 'search';
  return options;
};

module.exports = exported;
