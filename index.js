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
  return indexOf(Intl, collator, string, substring);
}

export function indexOf(Intl, collator, string, substring) {
  const slicesGenerator = makeSlicesGenerator(Intl, collator, string, substring);

  for (const { slice, index } of slicesGenerator) {
    if (collator.compare(slice, substring) === 0) {
      indexOf.lastLength = slice.length;
      return index;
    }
  }
  return -1;
}

export function* makeSlicesGenerator(Intl, collator, string, substring) {
  const { ignorePunctuation, locale } = collator.resolvedOptions();

  const punctuationCollator = ignorePunctuation ?
    new Intl.Collator(locale, { ignorePunctuation: true }) :
    null;

  function isConsidered(grapheme) {
    // concatenation with 'a' is a workaround for Node issue
    return punctuationCollator.compare('a', `a${grapheme}`) !== 0;
  }

  function countOfConsideredGraphemes(graphemes) {
    const count = punctuationCollator ?
      graphemes.filter(({ considered }) => considered).length :
      graphemes.length;
    return count;
  }

  const segmenter = Intl.Segmenter ?
    new Intl.Segmenter(locale, { granularity: 'grapheme' }) :
    {
      *segment(string) {
        let index = 0;
        for (const segment of string) {
          yield { segment, index };
          index += segment.length;
        }
      }
    };

  const substringGraphemes = Array.from(segmenter.segment(substring));
  const substringLength = punctuationCollator ?
    substringGraphemes.filter(({ segment }) => isConsidered(segment)).length :
    substringGraphemes.length;

  const sliceArray = [];
  for (const grapheme of segmenter.segment(string)) {
    const isAlreadyFull = countOfConsideredGraphemes(sliceArray) === substringLength;
    if (isAlreadyFull) {
      sliceArray.shift();
    }

    const considered = punctuationCollator ? isConsidered(grapheme.segment) : undefined;
    sliceArray.push({ ...grapheme, considered });

    const isNotYetFull = countOfConsideredGraphemes(sliceArray) < substringLength;
    if (isNotYetFull) {
      continue;
    }

    const slice = sliceArray.map(({ segment }) => segment).join('');
    const index = sliceArray[0].index;
    yield { slice, index };
  }
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

