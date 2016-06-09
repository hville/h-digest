module.exports = function(options) {
	return new Quant({
		maximumSize: options && options.maximumSize || 27,
		nominalSize: options && options.nominalSize || 17
	})
}

function last(arr) {
	return arr[arr.length-1]
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
	var sumWi = 0,
			idx = 0,
			old = this.data.arr.reverse(),
			nvs = this.data.nvs,
			len = this.options.nominalSize,
			arr = [],
			targetWeight = i2w2(len, this.data.sampleQuantity, idx),
			nextItm,
			nextVal

	if (old.length + nvs.length < len) return miniCompile(this)

	nvs.sort(compareDsc)

	arr[0] = [0,0]
	while (old.length + nvs.length) {
		if (!old.length || last(nvs) < last(old)[0] ) {
			nextVal = nvs.pop()
			if (sumWi + 1/2 < targetWeight) {
				arr[idx][0] = (arr[idx][0] * arr[idx][1] + nextVal) / (arr[idx][1] + 1)
				arr[idx][1] += 1
			} else {
				this.data.weights[idx] = sumWi
				idx = arr.push([nextVal, 1]) - 1
				targetWeight = i2w2(len, this.data.sampleQuantity, idx)
			}
			sumWi += 1
		}	else {
			nextItm = old.pop()
			if (sumWi + nextItm[1]/2 < targetWeight) {
				arr[idx][0] = (arr[idx][0] * arr[idx][1] + nextItm[0] * nextItm[1]) / (arr[idx][1] + nextItm[1])
				arr[idx][1] += nextItm[1]
			} else {
				this.data.weights[idx] = sumWi
				idx = arr.push(nextItm) - 1
				targetWeight = i2w2(len, this.data.sampleQuantity, idx)
			}
			sumWi += nextItm[1]
		}
	}
	if (idx !== len-1) {
		throw('CompileError: length mismatch '+(idx+1)+'!=='+len+'!=='+this.options.nominalSize)
	}
	this.data.weights[idx] = sumWi
	if (this.data.weights[idx] !== this.data.sampleQuantity) {
		var msg = 'CompileError: weighting mismatch '+this.data.weights[idx]+'!=='+this.data.sampleQuantity
		throw Error([msg, sumWi, idx, len-1].join(', '))
	}

	this.data.arr = arr
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
		this.data.nvs.push(v[i])
	}
	else this.data.nvs.push(v)
	this.data.sampleQuantity += v.length || 1
	this.data.isCompiled = false
	if (this.data.arr.length > this.options.maximumSize) this.compile()
	return this
}
