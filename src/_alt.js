var upperBound = require('./upperbound')

var wgt = {}

function weights(len) {
	var lst = len-1,
			ps = Array(len)
	for (var i=0; i<len; ++i) {
		var p = i/lst
		ps[i] = (15 + 10 * p - 30 * p*p + 12 * p*p*p) * p*p / 7
	}
	return ps
}

module.exports = CDF

/*
	Lighter, simpler version
	* automatic weights
	* no shifting
*/
function CDF(len) {
	// properties
	this.probs = wgt[len] || (wgt[len] = weights(len))
	this.values = []
	this.ranks = []
	// method
	this.push = pushLossless
}

CDF.prototype = {
	constructor: CDF,
	percentile: quantile,
	quantile: quantile,
	get min() { return this.values[0] },
	get max() { return this.values[this.values.length - 1] },
	get N() { return this.ranks[this.ranks.length-1] },
	get ave() {
		var vs = this.values,
				rs = this.ranks,
				M1 = rs.length-1,
				sum = vs[0] + vs[M1]
		for (var i=0; i<M1; ++i) sum += (vs[i+1] + vs[i]) * (rs[i+1] - rs[i])
		return sum/2/rs[M1]
	},
	Q: quantile,
	F: cdf,
	f: pdf
}

function pushLossless(val) {
	var j = upperBound(this.values, val),
			vs = this.values,
			rs = this.ranks
	if (rs.length === this.probs.length) return (this.push = pushCompress).call(this, val)

	for (var i=rs.length; i>j; --i) {
		rs[i] = i+1
		vs[i] = vs[i-1]
	}
	rs[j] = j ? rs[j-1] + 1 : 1
	vs[j] = val
}

function pushCompress(val) {
	var j = upperBound(this.values, val),
			i = j-1,
			vs = this.values,
			rs = this.ranks,
			M = rs.length

	if (j === M) {
		// preserve max: v[N] == max
		++rs[i]
		vs[i] = val
		return
	}
	if (j === 0) {
		// preserve min: v[0] == min
		vs[j] = val
		// increment ranks
		for (j=1; j<M; ++j) ++rs[j]
		return
	}
	// increment ranks
	for (var k=j; k<M; ++k) ++rs[k]
	// simple merge for identical values
	if (val === vs[j]) return
	// remove, shift, insert
	var rnk = ((rs[j] - 1)*(val - vs[i]) + (rs[i] + 1)*(vs[j] - val)) / (vs[j] - vs[i]),
			prb = rnk/rs[M-1]

	if (prb > this.probs[j]) {
		rs[j] = rnk
		vs[j] = val
	}
	else if (prb < this.probs[i]) {
		rs[i] = rnk
		vs[i] = val
	}
	//default: simple merge
}

/**
 * Quantile function, provide the value for a given probability
 * @param {number} prob - probability or array of probabilities
 * @return {number} value or array of values
 */
function quantile(prob) {
	var vs = this.values,
			rs = this.ranks,
			M = rs.length,
			h = rs[M-1] * prob + 0.5, // 0.5 <= h <= N+0.5
			j = upperBound(rs, h), //      0 <= j <= M
			i = j-1
	return j === 0 ? vs[0]
		: j === M ? vs[M-1]
		: vs[i] + (vs[j] - vs[i]) * (h-rs[i]) / (rs[j]-rs[i])
}


/**
 * @param {number} x - probability or array of probabilities
 * @return {number} value or array of values
 */
function cdf(x) {
	var vs = this.values,
			rs = this.ranks,
			M = rs.length,
			N = rs[M-1],
			j = upperBound(vs, x),
			i = j-1
	return (j === 0 ? 0.5
		: j === M ? (N - 0.5)
		: rs[i] - 0.5 + (rs[j] - rs[i]) * (x - vs[i]) / (vs[j] - vs[i])
	) / N
}

/**
 * @param {number} x - probability or array of probabilities
 * @return {number} value or array of values
 */
function pdf(x) {
	var vs = this.values,
			rs = this.ranks,
			M = rs.length,
			N = rs[M-1]
	if (x === vs[0] || x === vs[M-1]) return 0.5/N
	var j = upperBound(vs, x),
			i = j-1
	return j === 0 || j === M ? 0 : (rs[j] - rs[i]) / N
}
