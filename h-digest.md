<!-- markdownlint-disable MD004 MD007 MD010 MD041	MD022 MD024	MD032 -->

# Fundamentals

* CDF: `p = cdf(x) // prob(X <= x)`
* InverseCDF: `x = quantile(p)`
* rank: `r = rank(x) //actual rank or linear interpolation`
* value: `x = value(r) //actual rank or linear interpolation`

# Discrete case

* N: size or population
* `p == rank(x) / N` --> `rank(x) == p*N`

# Approximations

* `x ~= value(rank(x)) == value(p*N)`
* `quantile(p) ~= value(p*N)`

# Single Pass Compression

* values: `vs = [x1, x2, ...xN] //array of sorted values`
* ranks: `rs = [1, 2, ...N] //array of ranks`

For typical uses, compression can be acheived by removing value-items while preserving their rank.
Selection is done by targeting certain probabilities and only keeping the closest values
For example:
* 1000 values
* target probabilities: `ps = [0, .02, .10, .50, .90, .98, 1]`
* remaining rank: `[1, 20, 100, 500, 900, 980, 1000]`

The probabilities `0` and `1` ensure that the overall minimum and maximum are kept.
The remaining values represent the maximum for a given interval and preserve original rank and values for the quantile calculation

# Continuous Compression

For infinite sampling (eg. weather instrument data stream) continuous compression is required for every single or batch of samples.
This forces further approximations from the ideal single compression.
For a new value `x` find i and j where vs[i] < x <= vs[j] values The possible operations are as follows

* OL: Insert x in i and merge some lower sample: interpolate the rank x then and increment all rs[i..N-1]
* OM: Merge x in interval j: discard x and increment all rs[j..N-1]
* OH: Insert x in j and merge some upper sample: interpolate the rank x then and increment all rs[j..N-1]

The choice between these 3 operations can be made to better match the target distribution:

Example
* target: [..i...j..]
* caseLL: [.i...j...] `rs[i]/N < ps[i]` and `rs[j]/N < ps[j]`
* caseLH: [.i.....j.] `rs[i]/N < ps[i]` and `rs[j]/N > ps[j]`
* caseHL: [...i.j...] `rs[i]/N > ps[i]` and `rs[j]/N < ps[j]`
* caseHH: [...i...j.] `rs[i]/N > ps[i]` and `rs[j]/N > ps[j]`

caseLL: [.i...j...]
* =OL=> [...xxxj...] - best
* =OM=> [.i....j...]
* =OH=> [.i.xxx....] - worse

caseLH: [.i.....j.]
* =OL=> [...xxxxxj.] - ok if x closer to vs[i]
* =OM=> [.i......j.] - worse
* =OH=> [.i.xxxxx..] - ok if x closer to vs[j]

caseHL: [...i.j...]
* =OL=> [.....xj...]
* =OM=> [...i..j...] - best
* =OH=> [...i.x....]

caseHH: [...i...j.]
* =OL=> [.....xxxj.] - worse
* =OM=> [...i....j.]
* =OH=> [...i.xxx..] - best

Conclusion
LL => OL
LH => left OR right
HL => OM
HH => OH

# Interpolating a new rank for a new values
* `v0 < v < v1`; `r0 < r < r1`
* there are `(r1 - r0 - 1)` values between `v0` and `v1`
* `r = r0 + (r1-r0-1)(v-v0)/(v1-v0) + 1` = `r = r1 - (r1-r0-1)(v1-v) / (v1-v0)`
* if (r1-r0) = 1: `r = r0 + 1`
* all subsequent must be incremented

# Weighting Function

Any [0..1] => [0..1] Sigmoid to increase edge accuracy
* smoothstep: `3x^2 - 2x^3`, [0..1]=>[0..1],	d/dx = `6x(1 - x)`

# Linear interpolation

* t-Digest, q-Digest: weighted values, exact weights
* h-Digest: actual values, approximated weights

OPTIONS
* store float ranks
	* 2 divisions by N
	* N/2 rank increment
* store integer rank & decimal portion seperatly
	* not essential for Javascript where numbers are Always 64-bit Floating Point (IEEE 754 standard) with 52 bit mantisse
* Using 0-based arrays, `N = rs[rs.length - 1]`

: array of ranks === i+1
function rank(x): return rank of x, or linear interpolation

p = F(x) = rank(x) / N
