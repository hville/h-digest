module.exports = function(options) {
	return new Quant({
		maximumSize: options && options.maximumSize || 27,
		nominalSize: options && options.nominalSize || 17
	})
}

function merge(tgt, src) {
	if (tgt === src) return tgt
	if (Array.isArray(src)) {
		if (!src[1]) return tgt
		tgt[0] = (tgt[0] * tgt[1] + src[0] * src[1]) / (tgt[1] + src[1])
		tgt[1] += src[1]
		src[1] = 0
	}
	else tgt[0] = (tgt[0] * tgt[1] + src) / ++tgt[1]
	return tgt
}

function compareAsc(a,b) { return a[0] - b[0] }

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
		sampleQuantity: 0,
		isCompiled: true,
		weights: []
	}
}

Quant.prototype = {
	get size() { return Math.min(this.options.nominalSize, this.data.arr.length) },
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
	//this.data.size = this.options.nominalSize
	this.data.arr.length = 0
	this.data.sampleQuantity = 0
	this.data.isCompiled = true
	this.data.weights.length = 0
}

function miniCompile(ctx) {
	var arr = ctx.data.arr,
			Ws = ctx.data.weights
	Ws[0] = arr[0][1]
	for (var i=1; i<arr.length; ++i) Ws[i] = Ws[i-1] + arr[i][1]
	if (ctx.data.weights[arr.length-1] !== ctx.data.sampleQuantity) {
		throw Error('CompileError: weighting mismatch '+ctx.data.weights[arr.length-1]+'!=='+ctx.data.sampleQuantity )
	}
	ctx.data.isCompiled = true
	return ctx
}

function compile() {
	var sumWi = 0,
			iNext = 0,
			arr = this.data.arr,
			len = this.options.nominalSize

	arr.sort(compareAsc)
	if (arr.length <= this.options.nominalSize) return miniCompile(this)

	for (var i=0; i<len; ++i) {
		var targetWeight = i2w2(len, this.data.sampleQuantity, i)
		sumWi += arr[i][1]
		if (iNext <= i) iNext = i+1
		while(iNext < arr.length && ((sumWi + arr[iNext][1]/2 < targetWeight) || arr[i][1] === 0)) {
			sumWi += arr[iNext][1]
			merge(arr[i], arr[iNext])
			++iNext
		}
		this.data.weights[i] = sumWi
	}
	if (this.data.weights[len-1] !== this.data.sampleQuantity) {
		throw Error('CompileError: weighting mismatch '+this.data.weights[len-1]+'!=='+this.data.sampleQuantity )
	}
	arr.length = len
	this.data.isCompiled = true
	return this
}

function quantile(q) {
	if (!this.data.isCompiled) this.compile()
	if (q>1) q *= 100

	var Ws = this.data.weights,
			h = upperBound(Ws, q*this.data.sampleQuantity),
			arr = this.data.arr

	if (h === 0) return arr[0][0]
	if (h === undefined) return arr[arr.length-1][0]

	var low = arr[h-1],
			top = arr[h],
			deltaValue = top[0]-low[0],
			deltaWeight = (top[1]+low[1])/2

	return low[0] + deltaValue / deltaWeight * (this.data.sampleQuantity*q - Ws[h-1] + low[1]/2)
}

function quantiles(qs) {
	var ctx = this
	return qs.map(ctx.quantile)
}

function push(v) {
	if (Array.isArray(v)) for (var i=0; i<v.length; ++i) {
		this.data.arr.push([v[i], 1])
	}
	else this.data.arr.push([v, 1])
	this.data.sampleQuantity += v.length || 1
	this.data.isCompiled = false
	if (this.data.arr.length > this.options.maximumSize) this.compile()
	return this
}
