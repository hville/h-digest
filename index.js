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
	var r = 2*i/(N-2)-1,
			A = 1 //1/(W/N-1)*20 // *4 since too steep otherwise
	return i === 0 ? 1
		: i === N-1 ? W
		: Math.floor((W-2)/2 * (r*Math.sqrt(A+1) / Math.sqrt(A+r*r) + 1) + 1) //floor instead of round to compensate 0-fill bias
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
		reset: function() {
			arr.length=0
			W=0
			Ws=[]
		},
		insert: insert,
		compile: compile,
		quantile: quantile,
		quantiles: quantiles,
		maxima: maxima
	}

	function insert(v) {
		if (Array.isArray(v)) for (var i=0; i<v.length; ++i) arr.push([v[i], 1])
		else arr.push([v, 1])
		W += v.length || 1
		isCompiled = false
		if (arr.length > maxN) compile()
		return this
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
			while(iNext < arr.length && (sumWi < targetWeight || arr[i][1] === 0)) { //TODO bad condition favors left bias
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

	function maxima() {
		if (arr.length > N) compile()
		return [arr[0][0], arr[N-1][0]]
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
