<!-- markdownlint-disable MD004 MD007 MD010 MD041	MD022 MD024	MD032 -->

# Requirements

* preserve maximas: `v[0] == min`, `v[N] == max`
* constant cummulative weighting for fast lookups: `weights == [0..1]`

# Fundamentals

* CDF: `p = cdf(x) // prob(X <= x)`
* InverseCDF: `x = quantile(p)`

## Discrete case
* size or population: `N`
* `p == rank(x) / N` --> `rank(x) == p*N`

## Approximations
* `x ~= value(rank(x)) == value(p*N)`
* `quantile(p) ~= value(p*N)`

# Ideal Case : Single Pass Compression

* values: `vs = [x1, x2, ...xN] //array of sorted values`
* ranks: `rs = [1, 2, ...N] //array of ranks`

For typical uses, compression can be acheived by removing value-items while preserving their rank.
Selection is done by targeting certain probabilities and only keeping the closest values
For example:
* 1000 values
* target probabilities: `ps = [0, .02, .10, .50, .90, .98, 1]`
* remaining ranks: `[1, 20, 100, 500, 900, 980, 1000]`

The probabilities `0` and `1` ensure that the overall minimum and maximum are kept.
The remaining values represent the maximum for a given interval and preserve original rank and values for the quantile calculation

# Actual Case : Continuous Compression

For infinite sampling (eg. weather instrument data stream) continuous compression is required for every single or batch of samples.
This forces further approximations from the ideal single compression.
For a new value `x` find `i` and `j` where `vs[i] < x <= vs[j]` values and interpolate the implied rank `r`.

The possible operations are as follows
* left: replace the value `vs[i]` with `x` and rank `rs[i]` with `r`. Continue left as required with the old replaced values
* merge: Merge `x` in interval `j`: discard `x` and increment all `rs[j..N-1]`
* right: replace the value `vs[j]` with `x` and rank `rs[j]` with `r`. Continue right as required with the old replaced values

The choice between these 3 operations is based on matching the desired weighting function

# Interpolating a new rank for a new values
* `v0 < v < v1`; `r0 < r < r1`
* there are `(r1 - r0 - 1)` values between `v0` and `v1`
* `r = r0 + (r1-r0-1)(v-v0)/(v1-v0) + 1` or `r1 - (r1-r0-1)(v1-v) / (v1-v0)` or `r1 - (r1-r0-1)(1 - (v-v0)/(v1-v0)`

# Weighting Function
Any [0..1] => [0..1] Sigmoid to increase edge accuracy

## Weighting for Constant Errors relative to ends
* w/x + w/(1-x) = w/(x-x2) = K
* w = `6x(1 - x)` --> parabola pdf
* `cdf = 3x^2 - 2x^3`

## Weighting for Constant Errors relative closest ends
* K = x < 1/2 ? w/x : w/(1-x)
* w = x < 1/2 ? Kx : K(1-x) --> triangular

## Weighting for Constant Errors relative to ends RMS
* K = sqrt( (w/x)^2 + (w/(1-x))^2 ) = w/(x-x2) * sqrt( 1 - 2(x-x2) )
* w = K(x-x2) / sqrt( 1 - 2(x-x2) ) --> center scaling
* `(x-x2)(1+2(x-x2))`is a very good approximation === x x2 -4x3 +2x4
	- parabola scaled with another inverse parabola
* `CDF = (15x2 10x3 -30x4 12x5)/7`

