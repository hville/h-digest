<!-- markdownlint-disable MD004 MD007 MD010 MD041	MD022 MD024	MD032 -->
# h-digest

*takes a large and continuous data stream and retains a CDF approximation* -
***small, simple, no dependencies***

[Example](#Example) |
[Features](#Features) |
[Limitations](#Limitations) |
[Why](#Why) |
[API](#API) |
[License](#license)

# Example

```javascript
HD = require('hdigest')

var hd0 = HD(7), // limited to 7 retained samples
    hd1 = HD([5, 10, 40, 40, 10, 5]) // or with custom weighting
    hd2 = HD([0, .1, .2, .5, .7, .9, 1]) // or with custom relative ranks

hd0.push(4)
hd0.push([5,3,6,2,7,1,8])
hd0.push(0)

console.log(hd0.min) // 0
console.log(hd0.max) // 8
console.log(hd0.quantile(0.5)) // 4
console.log(hd0.quantile([0, 0.5, 1])) // [0, 4, 8]
```

# Features

* very small code and footprint for large number of instances
* around than 100 sloc, no dependencies, 2kb minified
* constant memory use, no compression steps and/or triggered garbage collection
* significantly faster than other implementations (about 3x gain)
* tested for random floats, discrete values, sorted values and repeated values

# Limitations

* this is an initial proof of concept that has not yet gone through rigorous use
(there is a chance that some sequences not yet tested could trigger a failure)
* could use some more utility methods (pdf, cdf, ...)
* currently no stops to prevent overwriting internal properties (all properties and methods are open)
* works in node and the browser but required a CJS module bundler for the browser (webpack, browserify, ...)

# Why

This proof of concept originated from the need to produce live animated boxplots
for a large quantity of variables during continuous Monte Carlo simulations
(ie. continuously computing the minimum, median, maximum, interquartile range, etc. for a stream of data).

There is already a good implementation on npm ([tdigest](https://www.npmjs.com/package/tdigest))
based on the [work of Dunning](https://github.com/tdunning/t-digest).
But the algorithm seamed more appropriate for a growing compressed set instead of a fixed set (ie constant memory).

This module makes a few significant changes to the algorithm:
* Samples retained represent the maximum for a given rank (instead of value weighted centroid of fixed rank)
* No value interpolation. Values are kept as-is, but ranks are interpolated.
* Fixed length, every new value discards an old one

The above points are thought to yield the following benefits:
* The use of maxima instead of weighted centroids is closer to the underlying math (F(x) = P(X<=x))
* Use of simpler, faster fixed arrays instead of a tree structure
* No need for tree compresion steps
* Better handling of sorted data, discrete data and repeated identical values
* Faster, smaller footprint for hundreds of instances to measure hundreads of instruments

There is likely other similar implementations around but I have not found them.
Drop a line if you know some and I will add a section for other implementaitons.

More [details available here](technical-notes.md) and in the short source code (~100 sloc)

# API

The API is still subject to changes

## Properties
`.N` number: total samples received
`.length` number: constant size of the compressed samples (length of all internal arrays)
`.probs` array: internal sigmoid/cdf used for selecting retained samples
`.values` array: selected retained sample values
`.ranks` array: interpolated ranks of retained samples
`.min` number: the minimum of all samples received. Same as `quantile(0)`
`.max` number: the minimum of all samples received. Same as `quantile(1)`

## Methods
`.push(number | array)` void: sample value(s) to be added
`.quantile(number | array)` {number | array}: value(s) for specified probabilitie(s)
`.percentile(number | array)` same as quantile, different name (*percentile values* from the *quantile function*)

# License

Released under the [MIT License](http://www.opensource.org/licenses/MIT)
