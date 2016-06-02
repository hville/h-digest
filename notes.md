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

