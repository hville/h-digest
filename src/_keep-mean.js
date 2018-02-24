var upperBound = require('../src/upperbound'),
		shift = require('./shift'),
		incrementAfter = require('./increment-after'),
		freeRank = require('./rank-free'),
		insertRank = require('./rank-insert'),
		mergeRank = require('./rank-merge')

module.exports = KeepMean

function KeepMean(probs) {
	// properties
	this.length = probs.length //TODO this.M ?
	this.probs = probs
	this.values = [] //TODO fixed size
	this.ranks = [] //TODO fixed size
	// method
	this._pushMode = pushLossless
}

KeepMean.prototype = {
	constructor: KeepMean,
	percentile: quantile,
	quantile: quantile,
	get min() { return this.values[0] },
	get max() { return this.values[this.values.length - 1] },
	get N() { return this.ranks[this.ranks.length-1] }, //TODO fail
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
	//TODO shift, increment
	for (var i=M; i>j; --i) {
		rs[i] = rs[i-1]+1
		vs[i] = vs[i-1]
	}
	rs[j] = j ? rs[j-1] + 1 : 1
	vs[j] = val
}

function pushCompress(val, j) {
	var vs = this.values,
			rs = this.ranks,
			M = rs.length,
			N = rs[M-1]
	// max
	if (j === M) return this._left(j-1, val, N + 1)
	// min
	if (j === 0) return this._right(0, val, 1)
	// mean preserving insertion
	var rnk = insertRank(vs, rs, j, val),
			prb = rnk/N
	if (isNaN(rnk)) throw Error('vs:'+vs.join()+' rs:'+rs.join()+' j:'+j+' val:'+val)
	if (prb > this.probs[j]) return this._right(j, val, rnk)
	if (prb < this.probs[j-1]) return this._left(j-1, val, rnk)
	// mean preserving merge: Δj = (vk + vj - 2V) / (vk - vi)`
	mergeRank(vs, rs,
		j === 1 ? j : (j === M-1 || rnk < (rs[j-1] + rs[j])/2) ? j-1 : j,
		val
	)
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
			N = rs[M-1],
			end = Math.max(idx, 2)
	while (rs[end] > this.probs[end+1]*N && end<M-4) ++end
	if (end === idx) return mergeRank(vs, rs, idx, val)
	freeRank(vs, rs, end)
	shift(vs,rs,idx,end)
	rs[idx] = rnk
	vs[idx] = val
	incrementAfter(rs, idx)
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
			N = idx === (M-1) ? rnk : rs[M-1],
			end = Math.min(idx, M-3)
	while (rs[end] < this.probs[end-1]*N && end > 3) --end
	if (end === idx) return mergeRank(vs, rs, idx, val)
	freeRank(vs, rs, end)
	shift(vs,rs,idx,end)
	rs[idx] = rnk
	vs[idx] = val
	incrementAfter(rs, idx)
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
		: j === M ? vs[M-1]
		: vs[j-1] + (vs[j] - vs[j-1]) * (h-rs[j-1]) / (rs[j]-rs[j-1])
}
