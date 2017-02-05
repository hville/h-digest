/**
 * Inpired by https://github.com/tdunning/t-digest
 * and by https://www.npmjs.com/package/tdigest
 */

/**
 * Quantile function approximation for (almost) infinite stream of samples
 * (up to 2^53 - 1 ~ 9e15)
 *
 * If a length is provided, the internal weighting function is used
 * If a cdf array is provided ([0..1]) it is used as-is
 * Any other array is interpreted as relative weights to be summed and scaled to [0..1]
 *
 * @param	{number|array} lenPdfCdf - the compressed length or pdf[any] or cdf[0..1]
 * @return {object} - new sample compressor
 */
module.exports = function(lenPdfCdf) {
	// a length number
	if (!Array.isArray(lenPdfCdf)) return new HDigest(createWeighting(lenPdfCdf))
	// a cdf
	if (lenPdfCdf.every(function(v,i,a) { return i ? (v >= a[i-1] && v <= 1) : v >= 0 })) {
		return new HDigest(lenPdfCdf)
	}
	// a pdf
	if (lenPdfCdf[0]) lenPdfCdf.unshift(0) //to preserve minimum
	if (lenPdfCdf[lenPdfCdf.length-1]) lenPdfCdf.push(0) //to preserve maximum
	var sum = lenPdfCdf.reduce(function(r, v) { return r + v })
	return new HDigest(lenPdfCdf.map(function(v) { return v/sum }))
}
/**
 * Weighting function
 * Possible weighting strategies:
 * - w ~ distance to closest end (triangular pdf): w = x < 1/2 ? kx : k(1-x)
 *	 - based on constant w/distance
 * - w ~ sum of end distances (parabola pdf): w = kx(1-x) ie: (1/x + 1/(1-x))
 *	 - based on constant w/x + w/(1-x) = w/(x(1-x))
 *	 - integrates to y = 3x^2 - 2x^3
 * - w ~ RMS sum of end distances ('pointy' parabola) w = kx(1-x) / sqrt( 1 - 2x(1-x) )
 *	 - based on constant sqrt( (w/x)^2 + (w/(1-x))^2 ) = w/(x(1-x)) * sqrt(1 - 2x(1-x))
 *	 - very good approximation: w = k(x-x2)(1+2(x-x2))
 *	 - integrates to y = ( 15x^2 + 10x^3 - 30x^4 + 12x^5 ) / 7
 * Only the RMS method is used here
 * Evaluated at half intervals (i+1/2)/(M-2); 0<i<M-2
 * @param	{number} len number of retained values
 * @return {array} node weighting array [0..1]
 */
function createWeighting(len) {
	var ps = Array(len)
	for (var i=0; i<len; ++i) {
		var p = i/(len-1)
		ps[i] = (15 + 10 * p - 30 * p*p + 12 * p*p*p) * p*p / 7
	}
	return ps
}
// binary search
function upperBound(arr, v) {
	var low = 0,
			high = arr.length
	while (low < high) {
		var mid = (low + high) >>> 1
		if (arr[mid] < v) low = mid + 1
		else high = mid
	}
	return high
}
function HDigest(probs) {
	// properties
	this.length = probs.length
	this.probs = probs
	this.values = []
	this.ranks = []
	this.N = 0
	// method
	this._pushMode = pushLossless
}
HDigest.prototype = {
	constructor: HDigest,
	percentile: quantile,
	quantile: quantile,
	get min() { return this.values[0] },
	get max() { return this.values[this.values.length - 1] },
	_right: right,
	_left: left,
	push: push
}
function push(val) {
	if (Array.isArray(val)) {
		for (var i=0; i<val.length; ++i) this._pushMode(val[i], upperBound(this.values, val[i]))
	}
	else return this._pushMode(val, upperBound(this.values, val))
}
function pushLossless(val, j) {
	if (this.N === this.length) {
		this._pushMode = pushCompress
		return this._pushMode(val, j)
	}
	var vs = this.values,
			rs = this.ranks
	++this.N
	for (var i=rs.length; i>j; --i) {
		rs[i] = rs[i-1]+1
		vs[i] = vs[i-1]
	}
	rs[j] = j ? rs[j-1] + 1 : 1
	vs[j] = val
}
function pushCompress(val, j) {
	var vs = this.values,
			rs = this.ranks
	var i
	++this.N

	switch (j) {
		case vs.length:
			return this._left(j-1, val, this.N)
		case 0:
			for (i=0; i<rs.length; ++i) ++rs[i]
			return this._right(0, val, 1)
		default:
			for (i=j; i<rs.length; ++i) ++rs[i]
			if (val === vs[j]) return
			var mid = (vs[j]+vs[j-1])/2,
					rnk = val > mid ? (rs[j]+rs[j-1]-1)/2 : (rs[j]+rs[j-1]+1)/2
			var prb = rnk/this.N
			if (prb > this.probs[j]) return this._right(j, mid, rnk)
			if (prb < this.probs[j-1]) return this._left(j-1, mid, rnk)
	}
}
/**
 * inserts a new value, cascading to the high side
 * val < v[i] < v[i+1], val replaces v[i], v[i+1] is shifted right
 * @param	{nunmber} idx - index where to insert the new value
 * @param	{number} val - new value to be inserted
 * @param	{number} rnk - rank of the new value to be inserted
 * @return {void}
 */
function right(idx, val, rnk) {
	var rs = this.ranks,
			vs = this.values,
			end = idx
	while (rs[end] > this.probs[end+1]*this.N) ++end
	for (var i=end; i>idx; --i) {
		rs[i] = rs[i-1]
		vs[i] = vs[i-1]
	}
	rs[idx] = rnk
	vs[idx] = val
}
/**
 * inserts a new value, cascading to the low side
 * v[i-1] < v[i] < val, val replaces v[i], v[i-1] is shifted left
 * @param	{nunmber} idx - index where to insert the new value
 * @param	{number} val - new value to be inserted
 * @param	{number} rnk - rank of the new value to be inserted
 * @return {void}
 */
function left(idx, val, rnk) {
	var rs = this.ranks,
			vs = this.values,
			end = idx
	while (rs[end] < this.probs[end-1]*this.N) --end
	for (var i=end; i<idx; ++i) {
		rs[i] = rs[i+1]
		vs[i] = vs[i+1]
	}
	rs[idx] = rnk
	vs[idx] = val
}
/**
 * Quantile function, provide the value for a given probability
 * @param {number|array} prob - probability or array of probabilities
 * @return {number|array} value or array of values
 */
function quantile(prob) {
	var vs = this.values,
			rs = this.ranks
	if (Array.isArray(prob)) return prob.map(this.quantile, this)
	var h = (this.N + 1) * prob,
			j = upperBound(rs, h)
	if (j < 1) return vs[0]
	if (j === vs.length) return vs[vs.length-1]
	var	h1 = rs[j],
			h0 = rs[j-1]
	return vs[j-1] + (vs[j] - vs[j-1]) * (h-h0) / (h1-h0)
}
