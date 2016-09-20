/**
 * Inpired by https://github.com/tdunning/t-digest
 * and by https://www.npmjs.com/package/tdigest
 * with the algorithm changed to swap the value-rank axis
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
	return new HDigest(
		!Array.isArray(lenPdfCdf) ? createWeighting(lenPdfCdf)
		: lenPdfCdf[0] === 0 && lenPdfCdf[lenPdfCdf.length-1] === 1 ? lenPdfCdf
		: lenPdfCdf
			.reduce(function(r, v) { r.push(v); return r }, [0])
			.map(function(v,i,a) { return v/a[a.length-1] })
	)
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
 * @param	{number} len number of retained values
 * @return {array} node weighting array [0..1]
 */
function createWeighting(len) {
	var ps = Array(len)
	for (var i=0; i<len; ++i) {
		var p = i ===0 ? 0 : i/(len-1)
		ps[i] = (15 + 10 * p - 30 * p*p + 12 * p*p*p) * p*p / 7
	}
	return ps
}
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
	var pushMode = pushLossless.bind(this)
	this.length = probs.length
	this.probs = probs
	this.values = []
	this.ranks = []
	this.N = 0

	this.push = function(val) {
		if (Array.isArray(val)) {
			for (var i=0; i<val.length; ++i) pushMode(val[i], upperBound(this.values, val[i]))
		}
		else pushMode(val, upperBound(this.values, val))
	}

	function pushLossless(val, j) {
		++this.N
		if (this.N === this.length) pushMode = pushCompress.bind(this)

		if (j === this.values.length) {
			this.values.push(val)
			this.ranks.push(this.N)
			return
		}
		for (var i=j; i<this.ranks.length; ++i) ++this.ranks[i]
		if (j === 0) {
			this.values.unshift(val)
			this.ranks.unshift(1)
		}
		else {
			this.values.splice(j, 0, val)
			this.ranks.splice(j, 0, this.ranks[j-1] + 1)
		}
	}

	function pushCompress(val, j) {
		++this.N
		if (j === this.values.length) {
			this._left(this.ranks.length-1, val, this.N)
			return
		}
		for (var i=j; i<this.ranks.length; ++i) ++this.ranks[i]
		if (j === 0) {
			this._right(j, val, 1)
			return
		}
		if (val !== this.values[j]) {
			var v1 = this.values[j],
					r1 = this.ranks[j],
					v0 = this.values[j-1],
					r0 = this.ranks[j-1],
					p0 = this.N * this.probs[j-1],
					p1 = this.N * this.probs[j],
					rnk = r1 - (r1 - r0) * (v1 - val) / (v1 - v0)
			if (rnk > p1) this._right(j, val, rnk)
			else if (rnk < p0) this._left(j-1, val, rnk)
		}
	}
}
HDigest.prototype = {
	_right: right,
	_left: left,
	percentile: quantile,
	quantile: quantile,
	get min() { return this.values[0] },
	get max() { return this.values[this.values.length - 1] }
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
	if (idx === this.values.length - 2) return // the end is reached
	var oldMin = this.values[idx],
			oldRnk = this.ranks[idx],
			np1 = this.N * this.probs[idx + 1]
	this.values[idx] = val
	this.ranks[idx] = rnk
	// the ranks are decreased by one to reflect rank at time of insertion
	// it is required to avoid a jam when sorted data is fed
	if (this.ranks[idx+1] -1 - np1 >= np1 - oldRnk + 1) this._right(idx + 1, oldMin, oldRnk)
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
	if (idx === 0) return
	var oldMax = this.values[idx],
			oldRnk = this.ranks[idx],
			np0 = this.N * this.probs[idx-1]
	this.values[idx] = val
	this.ranks[idx] = rnk
	if (np0 - this.ranks[idx-1] >= oldRnk - np0) this._left(idx - 1, oldMax, oldRnk)
}
/**
 * Quantile function, provide the value for a given probability
 * @param {number|array} prob - probability or array of probabilities
 * @return {number|array} value or array of values
 */
function quantile(prob) {
	if (Array.isArray(prob)) return prob.map(this.quantile, this)
	var h = (this.N + 1) * prob,
			j = upperBound(this.ranks, h),
			h1 = this.ranks[j],
			h0 = this.ranks[j-1]
	return j < 1 ? this.values[0]
		: j === this.values.length ? this.values[this.values.length-1]
		: this.values[j-1] + (this.values[j] - this.values[j-1]) * (h-h0) / (h1-h0)
}
