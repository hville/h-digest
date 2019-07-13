<!-- markdownlint-disable MD004 MD007 MD010 MD041 MD022 MD024 MD032 -->
# h-digest

*takes a large and continuous data stream and continuously only retain a reduced [empirical CDF](https://en.wikipedia.org/wiki/Empirical_distribution_function) approximation*

***small, simple, no dependencies***

• [Example](#example) • [Features](#features) • [Limitations](#limitations) • [Why](#why) • [API](#api) • [License](#license)

# Example

```javascript
HD = require('hdigest') // or import HD from 'hdigest'

// recorder with 7 retained samples with build-in weighting
var hd0 = HD(7)

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
* less than 200 sloc, no dependencies, 2kb minified
* constant memory use, no compression steps and/or triggered garbage collection
* significantly faster than other implementations (about 3-5x faster)
* tested with random floats, discrete values, sorted values, repeated values and skewed distribution

# Limitations

* no other utility methods (use `npm lazy-stats` for mean and variance)
* the remaining selected values do not preserve the mean of the inputs

# Background

There is already a good implementation on npm ([tdigest](https://www.npmjs.com/package/tdigest))
based on the [work of Dunning](https://github.com/tdunning/t-digest).
But the algorithm is more appropriate for a large growing compressed set instead of a smaller fixed set (ie constant memory).

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
* No garbage collection required

# API

## Creation

Samples are retained depending on how close they are to the target CDF probability points to be retained.

The main function has 3 different input types:
* `{number} length`: length of the internal target CDF to be generated
* `{Array<number>} CDF`: if strictly increasing from 0 to 1, the array will be used the target CDF
* `{Array<number>} PDF`: if not a CDF, the array will be treated as a PDF to be summed and normalized into a CDF

Note that to preserve the maxima, a PDF will be padded with 0s at both ends if not already the case. This will result in a recorder length that is greater than the input PDF

## Properties
* `.N` number: total samples received
* `.probs` array: internal sigmoid/cdf used for selecting retained samples
* `.values` array: selected retained sample values
* `.ranks` array: interpolated ranks of retained samples
* `.min` number: the minimum of all samples. Same as `quantile(0)`
* `.max` number: the minimum of all samples. Same as `quantile(1)`
* `.ave` number: an approximation of the sample average from the derived cdf

## Methods
* `.push(number | array)` void: sample value(s) to be added
* `.quantile(number | array)` {number | array}: value(s) for specified probabilitie(s)
* `.percentile(number | array)` same as quantile, different name (*percentile values* from the *quantile function*)

# License

[MIT](http://www.opensource.org/licenses/MIT) © [Hugo Villeneuve](https://github.com/hville)
