var upperBound = require('./upperbound')

module.exports = MatchRanks

function MatchRanks(probs) {
	// properties
	this.length = probs.length
	this.probs = probs
	this.values = []
	this.ranks = []
	// method
	this._pushMode = pushLossless
}

MatchRanks.prototype = {
	constructor: MatchRanks,
	percentile: quantile,
	quantile: quantile,
	get min() { return this.values[0] },
	get max() { return this.values[this.values.length - 1] },
	get N() { return this.ranks[this.ranks.length-1] },
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
	var vs = this.values,
			rs = this.ranks,
			M = rs.length
	if (rs[M-1] === this.length) {
		this._pushMode = pushCompress
		return this._pushMode(val, j)
	}

	for (var i=rs.length; i>j; --i) {
		rs[i] = rs[i-1]+1
		vs[i] = vs[i-1]
	}
	rs[j] = j ? rs[j-1] + 1 : 1
	vs[j] = val
}

function pushCompress(val, j) {
	var vs = this.values,
			rs = this.ranks,
			M = rs.length
	// increment ranks
	for (var i=j; i<M; ++i) ++rs[i]
	// preserve maximas: `v[0] == min`, `v[N] == max`
	if (j === vs.length) return this._left(j-1, val, rs[M-1] + 1)
	if (j === 0) return this._right(0, val, 1)
	// simple merge for identical values
	if (val === vs[j]) return
	// remove, shift, insert
	var mid = (vs[j]+vs[j-1])/2,
			rnk = val > mid ? (rs[j]+rs[j-1]-1)/2 : (rs[j]+rs[j-1]+1)/2
	var prb = rnk/rs[M-1]
	if (prb > this.probs[j]) return this._right(j, mid, rnk)
	if (prb < this.probs[j-1]) return this._left(j-1, mid, rnk)
	//default: simple merge
}

/**
 * inserts a new value, cascading to the high side
 * val < v[i] < v[i+1], val replaces v[i], v[i+1] is shifted right
 * @param	{number} idx - index where to insert the new value
 * @param	{number} val - new value to be inserted
 * @param	{number} rnk - rank of the new value to be inserted
 * @return {void}
 */
function right(idx, val, rnk) {
	var rs = this.ranks,
			vs = this.values,
			M = rs.length,
			end = idx
	while (rs[end] > this.probs[end+1]*rs[M-1]) ++end
	while (end>idx) {
		rs[end] = rs[end-1]
		vs[end] = vs[--end]
	}
	rs[idx] = rnk
	vs[idx] = val
}

/**
 * inserts a new value, cascading to the low side
 * v[i-1] < v[i] < val, val replaces v[i], v[i-1] is shifted left
 * @param	{number} idx - index where to insert the new value
 * @param	{number} val - new value to be inserted
 * @param	{number} rnk - rank of the new value to be inserted
 * @return {void}
 */
function left(idx, val, rnk) {
	var rs = this.ranks,
			vs = this.values,
			M = rs.length,
			end = idx
	while (rs[end] < this.probs[end-1]*rs[M-1]) --end
	while (end < idx) {
		rs[end] = rs[end+1]
		vs[end] = vs[++end]
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
			rs = this.ranks,
			M = rs.length
	if (Array.isArray(prob)) return prob.map(this.quantile, this)
	var h = (rs[M-1] + 1) * prob,
			j = upperBound(rs, h)
	return j < 1 ? vs[0]
		: j === vs.length ? vs[vs.length-1]
		: vs[j-1] + (vs[j] - vs[j-1]) * (h-rs[j-1]) / (rs[j]-rs[j-1])
}
