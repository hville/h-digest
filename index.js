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
	var N = options.nominalSize,
			maxN = options.maximumSize,
			arr = [],
			W = 0,
			Ws = [],
			isCompiled = true

	var ctx = {
		get array() { return arr },
		get N() { return Math.min(N,arr.length) },
		get W() { return W },
		get min() {
			if (!isCompiled) compile()
			return arr[0][0]
		},
		get max() {
			if (!isCompiled) compile()
			return arr[arr.length-1][0]
		},
		reset: function() {
			arr.length=0
			W=0
			Ws=[]
		},
		insert: insert,
		compile: compile,
		quantile: quantile,
		quantiles: quantiles
	}

	function insert(v) {
		if (Array.isArray(v)) for (var i=0; i<v.length; ++i) arr.push([v[i], 1])
		else arr.push([v, 1])
		W += v.length || 1
		isCompiled = false
		if (arr.length > maxN) compile()
		return ctx
	}

	function miniCompile() {
		Ws[0] = arr[0][1]
		for (var i=1; i<arr.length; ++i) Ws[i] = Ws[i-1] + arr[i][1]
		isCompiled = true
		return ctx
	}

	function compile() {
		var sumWi = 0,
				iNext = 0

		arr.sort(compareAsc)
		if (arr.length <= N) return miniCompile()

		for (var i=0; i<N; ++i) {
			var targetWeight = i2w2(N, W, i)
			sumWi += arr[i][1]
			if (iNext <= i) iNext = i+1
			while(iNext < arr.length && ((sumWi + arr[iNext][1]/2 < targetWeight) || arr[i][1] === 0)) {
				sumWi += arr[iNext][1]
				merge(arr[i], arr[iNext])
				++iNext
			}
			Ws[i] = sumWi
		}
		arr.length = N
		isCompiled = true
		return ctx
	}

	function quantile(q) {
		if (!isCompiled) compile()
		var h = upperBound(Ws, q*W)
		if (h === 0) return arr[0][0]
		if (h === undefined) return arr[arr.length-1][0]
		var low = arr[h-1]
		var top = arr[h]
		var deltaValue = top[0]-low[0]
		var deltaWeight = (top[1]+low[1])/2
		return low[0] + deltaValue / deltaWeight * (W*q - Ws[h-1] + low[1]/2)
	}

	function quantiles(qs) {
		return qs.map(quantile)
	}

	return ctx
}
