module.exports = function(options) {
	return new Quant({
		maximumSize: options && options.maximumSize || 27,
		nominalSize: options && options.nominalSize || 17
	})
}

function compareDsc(a,b) { return b - a }

function upperBound(arr, val, start) {
	for (var i = start || 0; i<arr.length; ++i) if (arr[i] > val) return i
}

function i2w2(N, W, i) {
	var r = 2*i/(N-2)-1
	return i === 0 ? 1
		: i === N-1 ? W
		: Math.ceil((W-2)/2 * (Math.SQRT2 * r / Math.sqrt(1+r*r) + 1) + 1)
}

function Quant(options) {
	this.options = options
	this.data = {
		arr: [],
		nvs: [],
		sampleQuantity: 0,
		isCompiled: true,
		weights: []
	}
}

Quant.prototype = {
	get size() { return Math.min(this.options.nominalSize, this.data.arr.length + this.data.nvs.length) },
	get N() { return this.data.sampleQuantity },
	get min() {
		if (!this.data.isCompiled) this.compile()
		return this.data.arr[0][0]
	},
	get max() {
		if (!this.data.isCompiled) this.compile()
		return this.data.arr[this.data.arr.length-1][0]
	},
	push: push,
	compile: compile,
	quantile: quantile,
	quantiles: quantiles,
	reset: reset
}

function reset() {
	this.data.arr.length = 0
	this.data.sampleQuantity = 0
	this.data.isCompiled = true
	this.data.weights.length = 0
}

function miniCompile(ctx){
	var arr = ctx.data.arr,
			nvs = ctx.data.nvs,
			wt = 0

	while(nvs.length) arr.push([nvs.pop(), 1])
	arr.sort(function(a,b) { return a[0] - b[0]})
	ctx.data.weights = arr.map(function(itm) {
		return wt += itm[1]
	})

	return ctx
}

function compile() {
	var data = this.data,
			old = data.arr.reverse(),
			nvs = data.nvs,
			len = this.options.nominalSize,
			arr = [[0,0]],
			targetWeight = i2w2(len, data.sampleQuantity, arr.length-1)

	if (old.length + nvs.length < len) return miniCompile(this)

	nvs.sort(compareDsc)
	data.weights = [0]

	function merge(target, item, tgtWgt) {
		var idx = arr.length-1
		if (data.weights[idx] < tgtWgt) { // join to last
			target[idx][0] = (target[idx][0] * target[idx][1] + item[0] * item[1]) / (target[idx][1] + item[1])
			target[idx][1] += item[1]
			data.weights[idx] += item[1]
		}	else { // push after last
			target.push(item)
			tgtWgt = i2w2(len, data.sampleQuantity, arr.length-1)
			data.weights[idx+1] = data.weights[idx] + item[1]
		}
		return tgtWgt
	}

	while (old.length + nvs.length) {
		if (!old.length || nvs[nvs.length-1] < old[old.length-1][0] ) {
			targetWeight = merge(arr, [nvs.pop(), 1], targetWeight)
		}	else {
			targetWeight = merge(arr, old.pop(), targetWeight)
		}
	}

	data.arr = arr
	data.isCompiled = true
	return this
}

function quantile(q) {
	if (!this.data.isCompiled) this.compile()
	if (q>1) q *= 100

	//TODO small error bias - greater error on lower side
	//https://en.wikipedia.org/wiki/Quantile, R-6, adjusted (empirically) for 0-based weighted items
	var Ws = this.data.weights,
			h = upperBound(Ws, q*(this.data.sampleQuantity+1) -1),
			arr = this.data.arr

	if (h === 0) return arr[0][0]
	if (h === undefined) return arr[arr.length-1][0]

	var low = arr[h-1],
			top = arr[h]

	return low[0] + (top[0]-low[0]) * (this.data.sampleQuantity*q - Ws[h-1] + low[1]/2) * 2 /(top[1]+low[1])
}

function quantiles(qs) {
	var ctx = this
	return qs.map(ctx.quantile)
}

function push(v) {
	if (Array.isArray(v)) for (var i=0; i<v.length; ++i) {
		this.data.nvs.push(v[i])
	}
	else this.data.nvs.push(v)
	this.data.sampleQuantity += v.length || 1
	this.data.isCompiled = false
	if (this.data.arr.length > this.options.maximumSize) this.compile()
	return this
}
