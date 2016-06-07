# Composite Curves

## variables
i: zero based index: [0, N-1]
n: 1 based index: [1, N]
w: cummulative weight: [0,W]
n0 does not exist so w(n0) = 0 and n(w0) = 0

## methods
w(n): go through each source items and assign new target position (or below to plug gaps)
n(w): go through each target item and add source until quota is met

## curves: weight to index n(w)
w(0) = 0
w(N) = W
symetry: w(1) = W-w(n-1) eg: 0-2.1-...-7.9-10 ROUND 0-2-...-8-10
can be scaled to `w'(1) = 1 & w'(n) = w(n-1)*(W-1)/W+1` to save maximas *1*-2.9-...-8.1-*10*
HALF curves: sqrt(n), ln(n),
FULL curves: (2n-1)+(2n-1)^9, , ...


## curves: index to weight w(n)
n(0) = 0; *i undefined*
n(W) = N
HALF curves: w^2
FULL curves: ((2n-1)*sqrt(1+A)) / sqrt(1+(2n-1)^2)

# w(n) = W/2*(r*sqrt(A+1) / sqrt(A+r^2) + 1)
```
r = 2n/N-1
w(n=0; r=-1) = W/2*(-sqrt(A+1) / sqrt(A+1) + 1) = 0
w(n=N/2; r=0) = W/2
w(n=N, r=1) = W/2*(sqrt(A+1) / sqrt(A+1) + 1) = N
```
```
dr = 2/N dn <--> 2dr = Ndn
dw/dn(n=0; r=-1) >= 1
dw/dn(n=N/2; r=0) >= W/N
w(r) = W/2*(r*sqrt(A+1) / sqrt(A+r^2) + 1)
dw/dr = W/2*sqrt(A+1)/sqrt(A+r^2)*(1 - r^2/(A+r^2))
dw/dn = W/N*sqrt(A+1)/sqrt(A+r^2)*(1 - r^2/(A+r^2))
```
setting fixed end derivatives warps all centroids to end
```
REJECTED:
dw/dn(n=N/2; r=0) >= 1
A >= 1/(W/N-1) & A+1 >= 1/(1-N/W)
dw/dn(n=N/2; r=0; A=1/(W/N-1)) = W/N*(1 - (1-N/W)) = 1
```
aim for constant relative center slope, whaterver it is
```
m = dw/dn * N/W = sqrt(A+1)/sqrt(A+r^2)*(1 - r^2/(A+r^2))
m(r=0) = 1 - 1/(A+1)
1/(1-m) - 1 = A
m/(1-m) = A
```

1. r = 2n/N-1
2. A >= 1/(W/N-1) |W>N
3. w(n) = W/2*(r*sqrt(A+1) / sqrt(A+r^2) + 1)

*preserve maximas*
force w(1) = 1
force w(N-1) = W-1
`w'(n-1) = w(n) = (W-2)/2*(r*sqrt(A+1) / sqrt(A+r^2) + 1) + 1`
`w'(N-1) = w(N) = (W-2) + 1 = W-1`










curve from [1,0] to [A,B]
line from [A,B] to [W-A, N-1-B] through [(W-1)/2, (N-1)/2]
curve from [W-A, N-1-B] to [W, N-1]

line slope m = ((W-1)-2B) / ((N-1)-2A)

## log
```
n(w) = ln(w)
n(1) = 0
n(A) = ln(A) = B
```
```
dn/dw = 1/w
dn/dw|w=1 = 1
dn/dw|w=A = 1/A = m
```
1. Constrained: `m = 1/A = exp(-B) = ((W-1)-2B) / ((N-1)-2A)`
2. Unlikely `(N-1)*exp(-B)-2 = (W-1)-2B` --> `2B + (N-1)*exp(-B) = W+1`
`N-1 = kB --> 2B + kB*exp(-B) = W+1 --> B(2 + k*exp(-B)) = W+1`

## power
```
n(w) = (w - w^(P+1)) / P
n(1) = (1 - 1) / P = 0
n(A) = B = (A-A^(P+1)) / P = A(1-A^P) / P
```
```
dn/dw = (1 - (P+1)w^P) / P
dn/dw|w=1 = P / P = 1
dn/dw|w=A = m = (1 - (P+1)A^P)) / P
```
```
B = A(1-A^P)/P
m = (1 - (P+1)A^P))/P = ((W-1)-2B) / ((N-1)-2A) --> (1 - (P+1)A^P))*(N-1-2A) = P(W-1-2B)
A^P = 1/(P+1) - P/(P+1) * (W-1-2B) / (N-1-2A)
A^P = 1-BP/A
```
Constrained


## root
```
n(w) = (w - w^(P+1)) / P
n(1) = (1 - 1) / P = 0
n(A) = B = (A-A^(P+1)) / P = A(1-A^P) / P
```
```
dn/dw = (1 - (P+1)w^P) / P
dn/dw|w=1 = P / P = 1
dn/dw|w=A = m = (1 - (P+1)A^P)) / P
```



#May 16, 2015

+		static double approximateSteeperArcSin(double x) {
 +			double absX = Math.abs(x);
 +			return Math.copySign((2.-absX*(0.5 - (5d/24d)*absX))*(1d-Math.sqrt(1d-absX)), x);
			}


#oertl commented on Feb 3, 2015
`sqrt(q*(1-q))`
* allows the size of all centroids, including the first and the last ones
* scale linearly with the number of points

example the first centroid:
```w_1: int_{0}^{w_1/W} 1/sqrt(q*(1-q)) dq <= 4*delta```
or
```arcsin(2*w_1/W) + pi/2 <= 4*delta```
or
```2*w_1/W <= sin(4*delta - pi/2)```
Hence, w_1 can get arbitrary large as W increases.

Consequently, for large W we can assume that the LHS of the constraint is almost equal to the RHS:
```int_{z_i}^{z_{i+1}} 1/sqrt(q*(1-q)) dq ~ 4*delta```

Summing up the constraints for all centroids gives
```int_0^1 1/sqrt(q*(1-q)) dq ~ N*4*delta or pi ~ N*4*delta``
which explains that the number of centroids N approaches a constant. The key difference is that the integral of
```1/(q*(1-q))``` is indefinite and that of ```1/sqrt(q*(1-q))``` is finite




# commented on Feb 1, 2015
For pluggable centroid scaling laws it could make sense to provide the antiderivative instead.
The antiderivative describes the scale on which you want to limit the histogram bin sizes.

```
ln(z/(1-z))	<->	q*(1-q)
arcsin(2*z-1)	<->	sqrt(q*(1-q))
```
If the antiderivative is given as parameter, the t-digest algorithm does not need to be concerned with numerical integration



#commented on Feb 1, 2015
```
i-th centroid corresponds to a histogram bin ranging from z_i to z_{i+1)
ln(z_{i+1}/(1-z_{i+1})) - ln(z_{i}/(1-z_{i})) <= 4*delta
```



#Jan 29, 2015
```
{(x_1, w_1), (x_2, w_2),...,(x_N, w_N)} // be the centroids in ascending
x_i is the mean and w_i is the weight of the i-th centroid
W be the sum of all weights W := w_1 + w_2 +...+ w_N.

The original t-digest
w_i/W*f(q_i) <= 4*delta,
where f(q):=1/(q*(1-q)) and deltais the reciprocal value of the compression.


Instead, I propose to use the constraint
int_{z_i}^{z_{i+1}} f(q) dq <= 4*delta
with z_i:=(sum_{j<i} w_i)/W.

the integral of f(q) from z_i to z_{i+1} can be solved analytically
new constraint can be expressed as
ln(z_{i+1}/(1-z_{i+1})) - ln(z_{i}/(1-z_{i})) <= 4*delta
or equivalently as (z_{i+1}-z_{i})<=(e^{4*delta}-1)*z_{i}*(1-z_{i+1})
The last inequality can be evaluated very efficiently, if the constant first factor on the right hand side is precalculated.
```

