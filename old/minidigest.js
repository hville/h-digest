module.exports = function(length) {
	//TODO length or [0..1] CDF or [any] PDF
	return new Digest(smoothstep(length))
}
function smoothstep(len) {
	var ps = Array(len)
	for (var i=0; i<len; ++i) {
		var p = i/(len-1)
		ps[i] = (15 + 10 * p - 30 * p*p + 12 * p*p*p) * p*p / 7
	}
	return ps
}
function Digest(probs) {
	//var pushMode = pushLossless.bind(this)
	this.length = probs.length
	this.probs = probs
	this.values = []
	this.ranks = []
	this.N = 0

	this.push = function(val) {
		if (Array.isArray(val)) for (var i=0; i<val.length; ++i) pushMode(val[i])
		else pushMode(val)
	}
}
function dsc(a,b) {
	return b - a
}
function upperBound(arr, val, start) {
	for (var i = start || 0; i<arr.length; ++i) if (arr[i] >= val) return i
}
Digest.prototype = {
	get size() { return this.data.arr.length },
	get min() {	return this.values[0] },
	get max() {	return this.values[this.values.length -1]	},
	push: push,
	quantile: quantile
}
function merge(ctx, item, tgtWgt) {
	var data = ctx.data,
			target = data.arr,
			lastIdx = target.length-1
	if (data.weights[lastIdx] < tgtWgt) { // join to last
		target[lastIdx][0] = (target[lastIdx][0] * target[lastIdx][1] + item[0] * item[1]) / (target[lastIdx][1] + item[1])
		target[lastIdx][1] += item[1]
		data.weights[lastIdx] += item[1]
	}	else { // push after last
		target.push(item)
		tgtWgt = ctx.getMaxRank(data.sampleQuantity, target.length-1)
		data.weights[lastIdx+1] = data.weights[lastIdx] + item[1]
	}
	return tgtWgt
}
function quantile(q) {
	if (Array.isArray(q)) return this.map(this.quantile, this)
	//TODO: check if we need to consider weighting?
	//TODO use new R6
	if (q>1) q *= 100

	var Ws = this.data.weights,
			h = q * (this.data.sampleQuantity + 1),
			j = upperBound(Ws, h),
			arr = this.data.arr
	if (j === 0) return arr[0][0]
	if (j === undefined) return arr[arr.length-1][0]

	var low = arr[j-1],
			top = arr[j]

	//Scaling over unit point upper side. if no weighting, reduces to R-6: ...*(h - Ws[j-1])
	return low[0] + (top[0]-low[0]) * ((low[1]-1)/2 + h - Ws[j-1]) * 2 /(top[1]+low[1])
}
function push(v) {
	var nvs = Array.prototype.concat(v).sort(dsc)
	var size = this.data.arr.length + nvs.length
	this.data.sampleQuantity += nvs.length
	if (size > this.maximumSize) compile(this, nvs)
	else miniCompile(this, nvs)
	return this
}
function miniCompile(ctx, nvs){
	var arr = ctx.data.arr,
			wt = 0
	while(nvs.length) arr.push([nvs.pop(), 1])
	arr.sort(function(a,b) { return a[0] - b[0]})
	ctx.data.weights = arr.map(function(itm) { return wt += itm[1] })
	return ctx
}
function compile(ctx, nvs) {
	if (ctx.size<11) console.log('A. compiling %d + %d = %d/%d', ctx.size, nvs.length, ctx.size + nvs.length, ctx.maximumSize)
	var data = ctx.data,
			old = data.arr.reverse(),
			maxRank = 1

	data.arr = [[0,0]]
	data.weights = [0]

	while (old.length + nvs.length) {
		var isNewStackLower = !old.length || (nvs[nvs.length-1] < old[old.length-1][0])
		maxRank = isNewStackLower	? merge(ctx, [nvs.pop(), 1], maxRank)
			: merge(ctx, old.pop(), maxRank)
	}
	if (ctx.size<11) console.log('B. compiling %d + %d = %d/%d', ctx.size, nvs.length, ctx.size + nvs.length, ctx.maximumSize)
	return ctx
}
