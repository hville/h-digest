var res = []
var N = 500
var quantiles = [0.02, 0.05, .1, .25, .5, .75, .95, .98]

for (var A=1; A<1.01; A += 1) { // fixed at 1
	for (var B=0; B<1.01; B += 0.01) { // absolutely no clue
		console.log('B',B)
		for (var C=0; C<1; C += 2) {
			for (var D=0; D<1; D += 10) { //NOT USED
				for (var E=0; E<1; E += 1) { //high side
					res.push(sim(N,A,B,C,D,E))
				}
			}
		}
	}
}


//CONCLuSIONS: A~=0; B~=0; C=0.75; D~0.91; E~0.1 if UNIFORM
//CONCLuSIONS: A~=0.4; B~=0.25; C=0.75; D~0.88; E~0.2 if BELL
//CONCLuSIONS: 0.7<A<0.9; B~=???; C=0.75; 0.6<D<0.86; E~??? if VeryBELL

//>>>return low[0] + (top[0]-low[0]) * (h - Ws[j-1] + 0.75*low[1]) * (1.9) /(top[1]+low[1])



res.sort(function(a,b) { return Math.abs(a[5]) - Math.abs(b[5]) })
var len = res.length
res.splice(15, len-30)
res.forEach(function(line) {
	console.log(line.map(function(v) {return v.toFixed(1)}).join(', '))
})




//********************
function sim(N, A, B, C, D, E) {
	function actualQuantile(q) { return rnd[Math.round((N-1)*q)] }
	function reduceSqErr(a, v, i) {
		var err = v/actuals[i] - 1
		return a + err * err
	}
	function reduceBias(a, v, i) {
		var err = v/actuals[i] - 1
		return a + err
	}
	var sqErr = 0
	var bias = 0
	for (var s=0; s<200; ++s) {
		var qt = customQuant(A, B, C, D, E)
		for (var i=0, rnd=[]; i<N; ++i) {
			var rand = (Math.random()-0.5)*Math.random() * 50
			rnd.push(rand)
		}
		qt.push(rnd)
		var qtResults = qt.quantiles(quantiles)
		rnd.sort(function(a,b) { return a-b })
		var actuals = quantiles.map(actualQuantile)
		sqErr += Math.sqrt(qtResults.reduce(reduceSqErr, 0))
		bias += qtResults.reduce(reduceBias, 0)
	}
	return [A, B, C, D, E, sqErr, bias*2]
}


//********************
function customQuant(Aa,Bb,Cc,Dd,Ee)	{
	function compareDsc(a,b) { return b - a }

	function upperBound(arr, val, start) {
		for (var i = start || 0; i<arr.length; ++i) if (arr[i] > val) return i
	}

	function i2w2(N, W, i) {
		var r = 2*i/(N-2)-1
		return i === 0 ? 1
			: i === N-1 ? W
			: (W-2)/2 * (Math.SQRT2 * r / Math.sqrt(1+r*r) + Aa) + Bb
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
		if (!this.data.isCompiled) this.compile()
		if (q>1) q *= 200

		var Ws = this.data.weights,
				h = q*(this.data.sampleQuantity+1),
				j = upperBound(Ws, h),
				arr = this.data.arr
		if (j === 0) return arr[0][0]
		if (j === undefined) return arr[arr.length-1][0]

		var low = arr[j-1],
				top = arr[j]

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
		if (this.data.arr.length > this.options.maximumSize) this.compile()
		return this
	}

	return new Quant({
		maximumSize: 25,
		nominalSize: 17
	})
}
