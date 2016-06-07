var Quant = require('./qnt')
var q = new Quant()
var t = require('assert')

/*for (var z=0; z<300000; ++z) q.insert(Math.random()*100)
console.log(q.quantiles([.09, .25, .5, .75, .91]))
console.log(q.N, q.W)
console.log(q.array)
*/

function trap(W, N, w) {
	var B = (N-1)/4,
			A = B,
			m0 = B/A,
			m1 = (1-B-B)/(1-A-A)
	return w === 1 ? 1
		: w === W ? N-1
		: w <= A ? w * m0 //1st 3rd
		: w >= W-A ? w * m0 + 3*(N-1)/4 //last 3rd
		: m1 * (w-A) + B //middle
}


function w2n2(W, N, w) {
	var r = (2 * w/W - 1), //*.84,
			q = (r < 0 ? Math.sqrt(1 + r)/2 : 1-Math.sqrt(1 - r)/2)// /0.6-0.2
	return w === W ? N-1 // else r <= +1, q <= 1, n <= N-2
		:	w === 0 ? 0 // else r >= -1, q >= 0, n >= 1
		: Math.round((N-2) * q)
}

function sqrt(W, N, w) {
	var s2W = Math.sqrt(2*W),
			A = (N-3) / (s2W - 2),
			B = 1 - A,
			wp1s2 = Math.pow(W/2+0.5,2),
			C = Math.sqrt(wp1s2-W+1/4) - wp1s2
	switch (w) {
	case 1: return 1
	case 2: return 2
	case W-1: return N-2
	case W: return N-1
	default: return w <= W/2 ? A * Math.sqrt(w) + B : N-1-(A * Math.sqrt(W-w) + B)
	}
}

function sqrt(W, N, w) {
	var s2W = Math.sqrt(2*W),
			A = (N-3) / (s2W - 2),
			B = 1 - A,
			wp1s2 = Math.pow(W/2+0.5,2),
			C = Math.sqrt(wp1s2-W+1/4) - wp1s2
	switch (w) {
	case 1: return 1
	case 2: return 2
	case W-1: return N-2
	case W: return N-1
	default: return w <= W/2 ? A * Math.sqrt(w) + B : N-1-(A * Math.sqrt(W-w) + B)
	}
}


//max bucket index (n) for a given sum of weights (w)
// y(w/W) = n/N = (B(2w/W-1)^A + S(2w/W-1) + 1)/2
// r = 2w/W - 1
// y(r) = (Br^A + Sr + 1)/2
// y(r=1) = 1 = B/2 + S/2 + 1/2 --> ***S = 1 - B***
// dy/dr = (ABr^(A-1) + 1 - B) / 2
// dn/dw = (N-1)dy/dw = (N-1)/2W dy/dr
// dn/dw|w=1 = (N-1)/2W dy/dr|r=2/W-1 = (N-1)/2W * (AB*(2/W-1)^(A-1) + 1 - B) / 2 = 1
// AB*(2/W-1)^(A-1) = 4W/(N-1) + B - 1
// B =~ 4W/(N*A)*(W/2)^(A-1)

function w2n(W, N, w) {
	var A = 9,
			B = 4*W/(N*A)*Math.pow(W/2,A-1),
			S = 1 - B
	var r = 2 * w/W - 1
	return w === W ? N-1 // else <= N-2
		:	w === 0 ? 0 // else >= 1
		: (N-2) * (((1-S) * Math.pow(r, A-1) + S) * r + 1) / 2
}



function closeTo(a, b, msg) {
	t.ok(Math.abs(a-b) < 1e-6, msg)
}

function testWeightFunction(fcn) { //(W, N, w)
	var N, W, w, n
	for (var i=0; i<10; ++i) {
		N = 5 * (3 + i)
		W = 5 * (2 + i)
		w = 1
		n = fcn(W, N, w)
		t.equal(n, 1, ['FAIL f(1)=1 :', W, N, w, n].join(','))
		w = 2
		n = fcn(W, N, w)
		t.ok(n<=2, ['FAIL f(2)<=2 :', W, N, w, n].join(','))
		w = W/2
		n = fcn(W, N, w)
		t.ok(n < (N-1)/2, ['FAIL f(W/2)<(N-1)/2 :', W, N, w, n].join(','))
		w = W
		n = fcn(W, N, w)
		t.equal(n, N-1, ['FAIL f(W)=N-1 :', W, N, w, n].join(','))
		var w0 = W/2-1
		var w1 = W/2+1
		var n0 = fcn(W, N, w0)
		var n1 = fcn(W, N, w1)
		closeTo(n0, N-1-n1, ['FAIL symetry :', W, N, w, n0, n1, (N-1)/2].join(','))
		var nlast = 1
		for (var j=2; j<W+1; ++j) {
			n = fcn(W, N, j)
			t.ok(n-nlast <= 1, ['FAIL increment :', W, N, j, n, n-nlast].join(','))
			nlast = n
		}
	}
}

testWeightFunction(trap)

