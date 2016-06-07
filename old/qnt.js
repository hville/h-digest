module.exports = function(options) {
	return new Quant({
		A: options && options.A || 9,
		N: options && options.N || 25
	})
}

function merge(tgt, src) {
	if (tgt === src) return tgt
	if (Array.isArray(src)) {
		tgt[0] = (tgt[0] * tgt[1] + src[0] * src[1]) / (tgt[1] + src[1])
		tgt[1] += src[1]
		src[1] = 0
	}
	else tgt[0] = (tgt[0] * tgt[1] + src) / ++tgt[1]
	if (!tgt[1]) throw Error(['noWeight'].join(','))
	return tgt
}

function compareAsc(a,b) { return a[0] - b[0] }

//max bucket index (n) for a given sum of weights (w)
// y(w/W) = n/N = (B(2w/W-1)^A + S(2w/W-1) + 1)/2
// r = 2w/W - 1
// y(r) = (Br^A + Sr + 1)/2
// y(r=1) = 1 = B/2 + S/2 + 1/2 --> S = 1 - B -->	0<B<1
// dy/dr =	(ABr^(A-1) + 1 - B) / 2
// dy/dr|1 = (AB + 1 - B) / 2 <= 1/(N/2-1) --> B <= (2/(N/2-1) - 1)/(A-1)
// eg: A = 11: B = B <= (2/(N/10 - 1/10
// B = (1-S)*2^(A-1) --> S = 1-B/2^(A-1)
// dy/dr = (ABr^(A-1) + 1-B/2^(A-1))/2
// y = n/N = ([ (1-S)*(2q-1)^(A-1) + S ](2q-1) + 1) / 2
function w2n(W, N, w, S, A) {
	// dy / dx = [ A * (1-S) * (2x-1)^(A-1) ] + S
	// dy / dx (0) = A - AS + S = A(1-S) + S = A + S(1-A) //if A is odd
	// dy / dx (1) = A - AS + S = A(1-S) + S = A + S(1-A)
	// dy / dx	(1/2) = S
	// *** dq/dw < 1/N; dn/dw < 1; dq/dr < 1/2N; 2dq/dr = 1 - 1/N/(A+1) <=	S
	var r = 2 * w/W - 1

	return w === W ? N-1 // else <= N-2
		:	w === 0 ? 0 // else >= 1
		: Math.ceil((N-2) * (((1-S) * Math.pow(r, A-1) + S) * r + 1) / 2)
}

function w2n2(W, N, w) {
	var r = (2 * w/W - 1), //*.84,
			q = (r < 0 ? Math.sqrt(1 + r)/2 : 1-Math.sqrt(1 - r)/2)// /0.6-0.2
	return w === W ? N-1 // else r <= +1, q <= 1, n <= N-2
		:	w === 0 ? 0 // else r >= -1, q >= 0, n >= 1
		: Math.round((N-2) * q)
}


function Quant(options) {
	var N = options.N,
			S = (options.A - 1/(N-2)) / (options.A - 1),
			W = 0,
			arr = []

	var ctx = {
		get array() { return arr },
		get N() { return N },
		get W() { return W },
		insert: insert,
		compile: compile,
		quantiles: quantiles
	}

	function insert(v) {
		if (Array.isArray(v)) for (var i=0; i<v.length; ++i) arr.push([v[i], 1])
		else arr.push([v, 1])
		W += v.length || 1
		if (arr.length > N) compile()
	}

	function compile() {
		var wi = 0,
				ni = 1, //next target position
				ei = 1 //next empty position
		arr.sort(compareAsc)
		for (var j=0; j<arr.length; ++j) {
			wi += arr[j][1]
			if (wi>W) throw Error(['wi>W !!!',W, wi, j].join(','))
			ni = w2n2(W, N, wi, S, options.A) //target position
			if (!ni) throw Error([W, N, wi, ni].join(','))
			if (ni > ei) ni = ei
			if (ni === j) continue
			if (!arr[ni][0]) throw Error(['noValue', ni].join(','))

			merge(arr[ni], arr[j])
			if (!arr[ni][1]) throw Error(['noWeight',ni].join(','))
			if (!arr[ni][0]) throw Error([ni].join(','))
			//if (!arr[ei][1]) throw Error(['ei inc while empty',ni].join(','))
			if (arr[ei][1]) ei++ //only increment when full
		}
		arr.length = N
		return this
	}

	function quantiles(qs) {
		if (arr.length > N) this.compile()
		var Wi = 0
		var Wt = W
		//ar Ws = qs.map(function(q) { return W*q })
		//console.log (Ws)
		var resQs = []
		var i = 0
		while (resQs.length < qs.length) {
			var cur = arr[i]
			var nxt = arr[++i]
			Wi += cur[1]
			if (!nxt) resQs.push(cur[0])
			else if (Wi+nxt[1]/2 >= Wt*qs[resQs.length]) resQs.push(
				cur[0] + 2 * (nxt[0]-cur[0]) / (nxt[1]+cur[1]) * (Wt*qs[resQs.length] - Wi + cur[1]/2)
			)
		}
		resQs.unshift(arr[0][0])
		resQs.push(arr[N-1][0])
		return resQs
	}

	return ctx
}
