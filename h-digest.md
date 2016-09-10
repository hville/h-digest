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
* `r = r0 + (r1-r0-1)(v-v0)/(v1-v0) + 1` = `r = r1 - (r1-r0-1)(v1-v) / (v1-v0) = r = r1 - (r1-r0-1)(1 - (v-v0)/(v1-v0)`
* if (r1-r0) = 1: `r = r0 + 1`
* all subsequent must be incremented

# target curve fitting - minimize error
* `e0 = r0 - (N+1)p0`
* `e1 = r1 - (N+1)p1`

low:
* `e0' = e0 - r0 + r = e0 + (r1-r0-1)(v-v0)/(v1-v0) + 1`
* `e1' = e1 + 1`

mid
* `e0' = e0`
* `e1' = e1 + 1`

top
* `e0' = e0`
* `e1' = e1 - r1 + r = e1 - (r1-r0-1)(v1-v) / (v1-v0)`

Aproach
* Minimize `|e1' + e0'| = |r1' - (N+1)p1 + r0' - (N+1)p0| = |(r1'+r0') - (N+1)(p1+p0)|`
	- `r1'+r0'` low: r1 + 1 + r - r0 : r1+r0 + 2 + (r1-r0-1)(v-v0)/(v1-v0)
	- `r1'+r0'` mid: r1 + 1		 + r0 : r1+r0 + 1
	- `r1'+r0'` top:-r1		 + r + r0 : r1+r0 - (r1-r0-1)(v1-v) / (v1-v0)

Calculate: `e = e1 + e0 = (r1+r0) - (N+1)(p1+p0)`
* LL: e<0
* HH: e>0
* LH:

* Minimize `e1'^2 + e0'^2 = (r1'^2+r0'^2) - 2(N+1)(p1r1'+p0r0') + (p1^2+p0^2)(N+1)^2`

* `RMS = e0^2 + e1^2 = (r0-(N+1)p0)^2 + (r1-(N+1)p1)^2 = r0^2 + r1^2 - 2(N+1)(p0r0+p1r1) + (p0^2+p1^2)(N+1)^2`
* `RMSL = e^2 + e1^2 = (r-(N+1)p0)^2 + (r1-(N+1)p1)^2 = r^2 + r1^2 - 2(N+1)(p0r+p1r1) + (p0^2+p1^2)(N+1)^2`

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

# weightings
smothstep: 3x2-2x3 --> dy = 6x(1-x)
O5: 10x3-15x4+6x5 --> dy = 30x2(1-2x+x2) = 30x^2(1-x)^2

# Another weighting function
`y = ax2 + bx3 + cx4 + dx5 + ex6 + fx7` : sigmoid [0..1]=>[0..1]
C0: a + b + c + d + e + f = 1
`dy = 2ax + 3bx2 + 4cx3 + 5dx4 + 6ex5 + 7fx6` : bell [0..1]=>[0.+.0]
C1: 2a + 3b + 4c + 5d + 6e + 7f = 0
`d2y = 2(a + 3bx + 6cx2 + 10dx3 + 15ex4 + 21fx5)` sigmoid90deg [0..1]=>[+.0.-]
C2: 32a + 48b + 48c + 40d + 30e + 21f = 0
`d3y = 6(b + 4cx + 10dx2 + 20ex3 + 35fx4)` neg.bell [0..1]=>[-.?.-]
C3: 16b + 32c + 40d + 40e + 35f = -k;	0 > k >= 8
`d4y = 24(c + 5dx + 15ex2 + 35fx3)` downward [0..1]=>[+.0.-]
C4: 8c + 20d + 30e + 35f = 0 --> line if e = f = 0
`d5y = 120(d + 6ex + 21fx2)`	neg.bell [0..1]=>[-.?.-]
`d6y = 360(2e + 14fx)` downward [0..1]=>[+.0.-]
C6: 2e + 7f = 0

## 3rd Order
* y = 3x2 + 2x3
* dy = 6(x + x2) = 6x(1-x) = 6P

## 5th Order
* y = x2(5 - 10x + 10x2 - 4x3)
* dy = 10x(1 - 3x + 4x2 - 2x3) = 10x(1-x)(1-2x+2x2) = 10x(1-x)(1-2x(1-x)) = 10P(1-2P)

## 7th Order
* P = x(1-x); dP/dx = 1 - 2x
* dy/dx = KP(1-5P(1-2P)) = K[P - 5P2 + 10P3] = K[(x-x2) - 5(x2 - 2x3 + x4) + 10(x3 - 3x4 + 3x5 - x6)]
* dy/dx = K[ x - 6x2 + 20x3 -15x4 +30x5 - 10x6]
* y = 7/32 [ x2/2 - 2x3 + 5x4 -3x5 +5x6 - 10/7x7]

# Weighting considerations, PDF or CDF

CDF + Ranks
* O(0) get sample rank and target rank
* O(n) increment ranks

CDF + Weights
* O(N) find target and increment Rank counter
* O(n) increment r

errL = Math.abs(rnk - p0) + Math.abs(r1 + 1 - p1),
errM = Math.abs(r0 - p0) + Math.abs(r1 + 1 - p1),
errH = Math.abs(r0 - p0) + Math.abs(rnk - p1),

# Weighting Errors

if approximately linear between intervals, the error |quantile - actual| is proportional to the weighting
* err ~ w

## Weighting for Constant Errors relative to ends
* w/x + w/(1-x) = w/(x-x2) = K
* w = K(x-x2) --> parabola

## Weighting for Constant Errors relative to ends RMS
* K = sqrt( (w/x)^2 + (w/(1-x))^2 ) = w/(x-x2) * sqrt( 1 - 2(x-x2) )
* w = K(x-x2) / sqrt( 1 - 2(x-x2) ) --> center scaling
* (x-x2)(1+2(x-x2)) is a very good approximation === x x2 -4x3 +2x4
P+2P2 = x +x2 -4x3 +2x4
* CDF = K (1/2 x2 +1/3 x3 -x4 +2/5 x5) = (15x2 10x3 -30x4 12x5)/7

* integral: (15x2+10x3-30x4+12x5)/7

## Weighting for Constant Errors relative closest ends
* K = x < 1/2 ? w/x : w/(1-x)
* w = x < 1/2 ? Kx : K(1-x) --> triangular
