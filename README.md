# localeIndexOf

*Find „cafe“ in „Fondation Café“*

[![Build Status](https://travis-ci.org/arty-name/locale-index-of.svg?branch=master)](https://travis-ci.org/arty-name/locale-index-of)

A prollyfill for `String.prototype.localeIndexOf` - 
a locale-aware Intl-powered version of `indexOf` with zero dependencies.

Many texts out there contain accents and other diacritical characters, 
and when they are not strictly necessary, like in „café“, it is hard 
to match them against user input. 

Here’s a relatable example. A website has a search field that provides 
suggestions, and the matched substring in each suggestion is highlighted. 
User has typed in „cafe“. You smartly find „café“ and display it as 
a suggestion. However you cannot really highlight it as a match, 
because the string is slightly different. 

`Intl.Collator` with `sensitivity: base` to the rescue! 
Except that it only has a `compare()` method, not `indexOf()`. 
So you can’t use it to find substrings. Well, now you can. 
`localeIndexOf` can do some grinding for you. It is modeled after 
`String.prototype.localeCompare` and can be used in a similar fashion. 
It extends the functionality of `Intl.Collator.compare()` to search, 
so you can even set `ignorePunctuation: true`.


## Installation

    npm install locale-index-of


## Usage

    var localeIndexOf = require('locale-index-of')(Intl);
    localeIndexOf('a café', 'cafe', 'de', { sensitivity: 'base' }); // = 2

or alternatively

    require('locale-index-of').prollyfill();
    'a café'.localeIndexOf('cafe', 'de', { sensitivity: 'base' }); // = 2
    

### Node.js support

Please note that “official” Node.js builds from nodejs.org 
only supported English locate in `Intl` for several major versions
before version 13. Everything works fine with v13+. If you need that 
in earlier versions of Node you could try the version in your distribution,
build Node yourself or check the Node documentation for `Intl` 
for more options.


## API


### default export `require('locale-index-of')`

The default export of the module is a function. Give it the `Intl` object 
and get the `localeIndexOf` function in return:

    var localeIndexOf = require('locale-index-of')(Intl);
  
    
### `localeIndexOf(string, substring, locales, options)`

It can take four parameters: where to search, what to look for,
and the same `locales` and `options` as `Intl.Collator` or 
`String.prototype.localeCompare`.

Return value: the offset of `substring`  in the `string` or `-1`.


### `localeIndexOf(string, substring, collator)`

It can take three parameters: where to search, what to look for,
and an instance of `Intl.Collator`.

Return value: the offset of `substring`  in the `string` or `-1`.


### `prototypeLocaleIndexOf(Intl)`

The module also exports method `prototypeLocaleIndexOf`. Give it 
the `Intl` object and get back the `localeIndexOf` function 
suitable for putting on `String.prototype`:

    String.prototype.localeIndexOf = require('locale-index-of').prototypeLocaleIndexOf(Intl);


### `prollyfill()`

You can achieve the same effect by calling exported method `prollyfill()`.
As a convenience, it will make `String.prototype.localeIndexOf` fall back 
to `String.prototype.indexOf` when `Intl` is not available.


### `String.prototype.localeIndexOf(substring, locales, options)`

It can take three parameters: what to look for and the same `locales` 
and `options` as `Intl.Collator` or `String.prototype.localeCompare`.

Return value: the offset of `substring`  in `this` or `-1` when not found.


### `localeIndexOf(string, substring, collator)`

It can take two parameters: what to look for and an instance of 
`Intl.Collator`.

Return value: the offset of `substring`  in `this` or `-1` when not found.


## Note on `ignorePunctuation: true`

The default behavior of `Intl.Collator` is to consider the whitespace punctuation. 

Since the length of the matched fragment can be different from the length of
what you have looked for, this length is exposed on 
`require('locale-index-of').noPunctuationIndexOf.lastLength`.


## See also

* [`Intl.Collator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Collator)
* [`String.prototype.localeCompare`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)
