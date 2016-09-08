module.exports = function(length) {
	return new HDigest(length)
}
function HDigest(length) {
	this.probs = smoothstep(length)
	this.maxima = []
	this.ranks = []
	this.push = pushOpen

	function pushOpen(val) {
		if (Array.isArray(val)) for (var i=0; i<val.length; ++i) this.push(val[i])
		var j = upperBound(this.maxima, val)
		this.maxima.splice(j, 0, val)
		this.ranks.splice(j, 0, j === 0 ? 0 : this.ranks[j-1])
		this.merge(j)
		if (this.maxima.length === length) this.push = pushFixed//, console.log('PUSHFIXED SET')
		return this
	}
	function pushFixed(val) {
		if (Array.isArray(val)) for (var i=0; i<val.length; ++i) this.push(val[i])
		var j = upperBound(this.maxima, val)
		if (j === 0) return this.newMin(val)//, console.log('DOING newMin', j)
		else if (j === this.maxima.length) return this.newMax(val)//, console.log('DOING newMax', j)
		else if (val === this.maxima[j]) return this.merge(j)
		var iFull = this.isFull(j-1),
				jFull = this.isFull(j-1)
		if (iFull && !jFull) this.merge(j, val) //HL
		else if (!iFull && !jFull) this.higher(j-1,val) //LL
		else if (iFull && jFull) this.lower(j,val) //HH
		else if (val < (this.maxima[j] - this.maxima[j-1]) / 2) this.higher(j-1,val)
		else this.lower(j,val)
	}
}
HDigest.prototype.isFull = function(idx) {
	return this.ranks[idx] > this.probs[idx] * (this.ranks[this.ranks.length - 1] + 1)
}
HDigest.prototype.newMin = function (min) {
	var oldMin = this.maxima[0]
	this.maxima[0] = min
	if (this.isFull(1)) this.lower(1, oldMin)
	else this.merge(1)
}
HDigest.prototype.lower = function (j, val) { // shift j down to val
	//console.log('lower')
	var v1 = this.maxima[j],
			r1 = this.ranks[j],
			v0 = this.maxima[j-1],
			r0 = this.ranks[j-1]
	this.maxima[j] = val
	this.ranks[j] -= (r1 - r0 - 1) * (v1 - val) / (v1 - v0)
	//repeat right while j high
	if (j < (this.maxima.length - 2) && this.isFull(j+1)) this.lower(j+1, v1)
	else this.merge(j+1)
}
HDigest.prototype.newMax = function (max) {
	var oldMax = this.maxima[this.maxima.length-1]
	this.maxima[this.maxima.length-1] = max
	this.higher(this.maxima.length-2, oldMax)
}
HDigest.prototype.higher = function (i, val) { // shift i up to val
	//console.log('left', j, val)
	var v1 = this.maxima[i+1],
			r1 = this.ranks[i+1],
			v0 = this.maxima[i],
			r0 = this.ranks[i]
	this.maxima[i] = val
	this.ranks[i] += (r1 - r0 - 1) * (val - v0) / (v1 - v0) + 1
	//repeat left until low is full
	if (i > 1 && !this.isFull(i-1)) this.higher(i-1, v0)
	else this.merge(i+1)
}
HDigest.prototype.merge = function (idx) { //val absorbed

	for (var i=idx; i<this.ranks.length; ++i) ++this.ranks[i]
}

HDigest.prototype.quantile = function(prob) {
	//console.log('QUANTILE', prob, ' maxima', this.maxima, 'ranks', this.ranks)
	//console.log('ps', this.probs.map(function(v, i) { return this.ranks[i]/this.ranks[this.ranks.length-1] }, this))
	if (Array.isArray(prob)) return prob.map(this.quantile, this)
	var n = this.ranks[this.ranks.length-1],
			h = (n + 1) * prob,
			j = upperBound(this.ranks, h),
			h1 = this.ranks[j],
			h0 = this.ranks[j-1]
			//console.log('p:%d, h0:%d, h:%d, h1:%d, j:%d, v0:%d, v1:%d, rnk', prob, h0, h, h1, j, this.maxima[j], this.maxima[j-1], this.ranks)
	return j < 1 ? this.maxima[0]
		: j >= this.ranks.length ? this.maxima[this.maxima.length-1]
		: this.maxima[j-1] + (this.maxima[j] - this.maxima[j-1]) * (h-h0) / (h1-h0)
}
function upperBound(arr, val) {
	for (var i = 0; i<arr.length; ++i) if (arr[i] >= val) return i
	return i
}
function smoothstep(len) {
	var ps = Array(len)
	for (var i=0; i<len; ++i) {
		var p = i/(len-1)
		ps[i] = p*p * (3 - 2*p)
	}
	return ps
}
//102