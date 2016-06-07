var nB = 100,
		nN = 0,
		aL = [],
		aH = [],
		nL = 0,
		nH = 0

function find(arr, val) {
	if (val > aH[0][0]) for (var i=0; i<aH.length; ++1)
	for (var i=0; i<res.length; ++i) if (v < res[i].v) return i
	return i
}


function addV(val) {

}



function Ctr(v, w) {
	this.v = v
	this.w = w
}
Ctr.prototype.add = function(val) {
	var v = val instanceof val ? val : {v:val, w:1}
	this.v = (this.v * this.w + v.v * v.w) / (this.w + v.w)
	this.w += v.w
}


function addValue(res, val, comparator) {
	var idx = getIndex(res, val) //index of first greater point
	if (idx === 0) res.unshift(new Ctr(val, 1))
	else if (idx === res.length) res.push(new Ctr(val, 1))
	var pick = comparator(res, val, idx)
	if (pick > 0) res[idx].add(val)
	else if (pick < 0 ) res[idx-1].add(val)
	else res.splice(idx-1, 0, val instanceof Ctr ? val : new Ctr(val, 1))
}

function rebalance(res, comparator) {
	for (var i=1; i<res.length; ++i) {
		var delta = comparator(res[i], val, i)
	}
}

function cClosest(res, val, idx) {
	return val + val - res[idx].v - res[idx-1].v
}

function cEmptiest(res, val, idx) {
	return res[idx-1].w - res[idx].w
}

function cEdgeWeighted(res, val, idx) {
	var N0=0
	var N1=0
	var Nn=0
	for (var i=0; i<idx; ++i) Nn += res[i].w
	N1 = Nn + res[idx].w/2
	N0 = Nn - res[idx-1].w / 2
	for (i = idx; i<res.length; ++i) Nn += res[i].w
	var S0 = N0*(Nn-N0) / Nn - res[idx-1].w
	var S1 = N1*(Nn-N1) / Nn - res[idx].w
	// return (N1-N0) - (N1*N1 - N0*N0)/Nn - (res[idx].w - res[idx-1].w)
	return S1 - S0
}

function cDeltaSlopeWeighted(res, val, idx) {
	if (idx < 2) return +1
	if (idx > res.length-2) return -1
	var S0N = (res[idx-1].w + res[idx-2].w) / (res[idx-1].v - res[idx-2].v)
	var S1N = (res[idx].w + res[idx-1].w) / (res[idx].v - res[idx-1].v)
	var S2N = (res[idx+1].w + res[idx].w) / (res[idx+1].v - res[idx].v)

	var X0 = (S1N - S0N) / (res[idx].v - res[idx-2].v)
	var X1 = (S2N - S1N) / (res[idx+1].v - res[idx-1].v)
	return X1 - X0 //to the highest slope change
}



function getIndex(res, val) {
	var v = val instanceof Ctrd ? val.v : val
	for (var i=0; i<res.length; ++i) if (v < res[i].v) return i
	return i
}

function addValue(res, val, comparator) {
	var idx = getIndex(res, val) //index of first greater point
	if (idx === 0) res.unshift(new Ctrd(val, 1))
	else if (idx === res.length) res.push(new Ctrd(val, 1))
	var pick = comparator(res, val, idx)
	if (pick > 0) res[idx].add(val)
	else if (pick < 0 ) res[idx-1].add(val)
	else res.splice(idx-1, 0, val instanceof Ctrd ? val : new Ctrd(val, 1))
}

function rebalance(res, comparator) {
	for (var i=1; i<res.length; ++i) {
		var delta = comparator(res[i], val, i)
	}
}

function cClosest(res, val, idx) {
	return val + val - res[idx].v - res[idx-1].v
}

function cEmptiest(res, val, idx) {
	return res[idx-1].w - res[idx].w
}

function cEdgeWeighted(res, val, idx) {
	var N0=0
	var N1=0
	var Nn=0
	for (var i=0; i<idx; ++i) Nn += res[i].w
	N1 = Nn + res[idx].w/2
	N0 = Nn - res[idx-1].w / 2
	for (i = idx; i<res.length; ++i) Nn += res[i].w
	var S0 = N0*(Nn-N0) / Nn - res[idx-1].w
	var S1 = N1*(Nn-N1) / Nn - res[idx].w
	// return (N1-N0) - (N1*N1 - N0*N0)/Nn - (res[idx].w - res[idx-1].w)
	return S1 - S0
}

function cDeltaSlopeWeighted(res, val, idx) {
	if (idx < 2) return +1
	if (idx > res.length-2) return -1
	var S0N = (res[idx-1].w + res[idx-2].w) / (res[idx-1].v - res[idx-2].v)
	var S1N = (res[idx].w + res[idx-1].w) / (res[idx].v - res[idx-1].v)
	var S2N = (res[idx+1].w + res[idx].w) / (res[idx+1].v - res[idx].v)

	var X0 = (S1N - S0N) / (res[idx].v - res[idx-2].v)
	var X1 = (S2N - S1N) / (res[idx+1].v - res[idx-1].v)
	return X1 - X0 //to the highest slope change
}
