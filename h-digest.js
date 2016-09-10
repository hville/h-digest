module.exports = function(length) {
	//TODO length or [0..1] CDF or [any] PDF
	return new HDigest(smoothstep(length))
}
function smoothstep(len) {
	var ps = Array(len)
	for (var i=0; i<len; ++i) {
		var p = i/(len-1)
		ps[i] = (15 + 10 * p - 30 * p*p + 12 * p*p*p) * p*p / 7
		//ps[i] = (3 - 2*p) * p*p
		//ps[i] = p*p * (5 - 10*p + 10*p*p - 4*p*p*p)
	}
	return ps
}
function upperBound(arr, val) {
	for (var i = 0; i<arr.length; ++i) if (arr[i] >= val) return i
}
function HDigest(probs) {
	var pushMode = pushLossless.bind(this)
	this.length = probs.length
	this.probs = probs
	this.values = []
	this.ranks = []
	this.N = 0
	//TODO min, max, percentile

	this.push = function(val) {
		if (Array.isArray(val)) { //TODO sort if many?
			for (var i=0; i<val.length; ++i) pushMode(val[i], upperBound(this.values, val[i]))
		}
		else pushMode(val, upperBound(this.values, val))
	}

	function pushLossless(val, j) {
		++this.N
		if (this.N === this.length) pushMode = pushCompress.bind(this)

		if (j === undefined) {
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
		if (j === undefined) {
			this.left(this.ranks.length-1, val, this.N)
			return
		}
		for (var i=j; i<this.ranks.length; ++i) ++this.ranks[i]
		if (j === 0) {
			this.right(j, val, 1)
			return
		}
		else if (val !== this.values[j]) {
			var v1 = this.values[j],
					r1 = this.ranks[j],
					v0 = this.values[j-1],
					r0 = this.ranks[j-1],
					rnk = r1 - (r1 - r0 - 1) * (v1 - val) / (v1 - v0),
					dir = this.direction(j, rnk)
			if (dir === 1) this.right(j, val, rnk)
			else if (dir === -1) this.left(j-1, val, rnk)
		}
	}
}
HDigest.prototype.direction = function(j, rnk) {
	if (j === 0) return 1
	if (j === this.values.length) return -1
	/**
	 * Choose to shift left, insert of shift right depending on absolute error
	 * errL = |rnk - p0| +	|r1 - p1| = L0 + L1
	 * errM = |r0 - p0| + |r1 - p1| = H0 + L1
	 * errH = |r0 - p0| + |rnk - p1| = H0 + H1
	 */
	var r0 = this.ranks[j-1],
			np1 = this.N + 1,
			p0 = np1 * this.probs[j-1],
			p1 = np1 * this.probs[j],
			L0 = Math.abs(rnk - p0),
			L1 = Math.abs(this.ranks[j] - p1),
			H0 = Math.abs(r0 - p0),
			H1 = Math.abs(rnk - p1)
	return L0 < H0 && L1 < H1 ? -1
		: L0 > H0 && L1 > H1 ? 1
		: 0 //also default to merge for edge cases
}
HDigest.prototype.right = function (idx, val, rnk) {
	if (val === this.values[idx+1]) return
	if (idx === this.values.length - 2) return
	var oldMin = this.values[idx],
			oldRnk = this.ranks[idx], //new value is inserted before
			// simplified .direction method
			p1 = (this.N + 1) * this.probs[idx + 1],
			L1 = Math.abs(this.ranks[idx + 1] - p1),
			H1 = Math.abs(oldRnk - p1)
	this.values[idx] = val
	this.ranks[idx] = rnk
	if (L1 > H1) this.right(idx + 1, oldMin, oldRnk)
}
HDigest.prototype.left = function (idx, val, rnk) {
	if (val === this.values[idx] || idx === 0) return
	var oldMax = this.values[idx],
			oldRnk = this.ranks[idx],
			// simplified .direction method
			p0 = (this.N + 1) * this.probs[idx-1],
			L0 = Math.abs(rnk - p0),
			H0 = Math.abs(this.ranks[idx-1] - p0)
	this.values[idx] = val
	this.ranks[idx] = rnk
	if (L0 < H0) this.left(idx - 1, oldMax, oldRnk)
}
HDigest.prototype.quantile = function(prob) {
	if (Array.isArray(prob)) return prob.map(this.quantile, this)
	var h = (this.N + 1) * prob,
			j = upperBound(this.ranks, h),
			h1 = this.ranks[j],
			h0 = this.ranks[j-1]
	return j < 1 ? this.values[0]
		: j === undefined ? this.values[this.values.length-1]
		: this.values[j-1] + (this.values[j] - this.values[j-1]) * (h-h0) / (h1-h0)
}
