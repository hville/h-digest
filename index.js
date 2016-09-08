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
		: (W-2)/2 * (Math.SQRT2 * r / Math.sqrt(1+r*r) + 1) + 1
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
	ctx.data.weights = arr.map(function(itm) { return wt += itm[1] })
	return ctx
}

function merge(ctx, item, tgtWgt) {
	var target = ctx.data.arr,
			data = ctx.data,
			idx = data.arr.length-1,
			len = ctx.options.nominalSize
	if (data.weights[idx] < tgtWgt) { // join to last
		target[idx][0] = (target[idx][0] * target[idx][1] + item[0] * item[1]) / (target[idx][1] + item[1])
		target[idx][1] += item[1]
		data.weights[idx] += item[1]
	}	else { // push after last
		target.push(item)
		tgtWgt = i2w2(len, data.sampleQuantity, target.length-1)
		data.weights[idx+1] = data.weights[idx] + item[1]
	}
	return tgtWgt
}

function compile() {
	//takes to stacks: newValues and oldWeigted and reverses them both (min last) (1 sort, 1 reverse)
	//takes the smallest from the two staks until empty to rebild a new sorted list (N check-pop-assign)
	//
	var data = this.data,
			old = data.arr.reverse(),
			nvs = data.nvs,
			len = this.options.nominalSize,
			targetWeight = i2w2(len, data.sampleQuantity, 0)
	if (old.length + nvs.length < len) return miniCompile(this)

	data.arr = [[0,0]]
	nvs.sort(compareDsc)
	data.weights = [0]

	while (old.length + nvs.length) {
		targetWeight = (!old.length || nvs[nvs.length-1] < old[old.length-1][0])
			? merge(this, [nvs.pop(), 1], targetWeight)
			: merge(this, old.pop(), targetWeight)
	}
	data.isCompiled = true
	return this
}

function quantile(q) {
	//TODO: check if we need to consider weighting?
	//TODO use new R6
	if (!this.data.isCompiled) this.compile()
	if (q>1) q *= 100

	var Ws = this.data.weights,
			h = q*(this.data.sampleQuantity+1),
			j = upperBound(Ws, h),
			arr = this.data.arr
	if (j === 0) return arr[0][0]
	if (j === undefined) return arr[arr.length-1][0]

	var low = arr[j-1],
			top = arr[j]

	//Scaling over unit point upper side. if no weighting, reduces to R-6: ...*(h - Ws[j-1])
	return low[0] + (top[0]-low[0]) * ((low[1]-1)/2 + h - Ws[j-1]) * 2 /(top[1]+low[1])
}

function quantiles(qs) {
	return qs.map(this.quantile, this)
}

function push(v) {
	if (Array.isArray(v)) for (var i=0; i<v.length; ++i) {
		this.data.nvs.push(v[i])
	}
	else this.data.nvs.push(v)
	this.data.sampleQuantity += v.length || 1
	this.data.isCompiled = false
	if (this.size > this.options.maximumSize) this.compile()
	return this
}
