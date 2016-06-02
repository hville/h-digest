var List = require('./list')

function Ctrd(v,w) {
	this.v = v
	this.w = w
}
Ctrd.prototype.merge = function(val) {
	if (val instanceof Ctrd) {
		this.v = (this.v * this.w + val.v * val.w) / (this.w + val.w)
		this.w += val.w
	}
	else {
		this.v = (this.v * this.w + val.v) / ++this.w
	}
	return this
}
Ctrd.prototype.copy = function() {
	return new Ctrd(this.v, this.w)
}

function concatCtrd(args) {
	var vals = []
	for (var i=0; i<args.length; ++i) {
		var val = args[i]
		if (val instanceof Ctrd) vals.push(val)
		else if (Array.isArray(val)) Array.prototype.push.apply(vals, concatCtrd(val))
		else vals.push(new Ctrd(val, 1))
	}
	return vals
}

function compareAsc(a,b) { return a.v - b.v }
function compareDsc(a,b) { return b.v - a.v }

function Quant(maxN) {
	var sizeW = 0
	//var sizeN = 0
	if (maxN === undefined) maxN = 10
	var list = new List(compareAsc)
	//console.log(list)
	this.size = {
		get W () { return sizeW },
		get N () { return list.size },
		get max () { return maxN }
	}
	this.list = list

	function maxWeight(wc) {
		var qi = wc/sizeW
		var maxW = 4 * sizeW / maxN * Math.sqrt(qi * (1-qi))
		return maxW
	}

	function cumWeight(qi) {
		var r = qi - 0.5
		return (80*r*r*r*r*r*r - 2) * r
	}

	this.insert = function(vals) {
		var args = [vals]
		for (var i=1; i<arguments.length; ++i) args[i] = arguments[i]
		var vs = concatCtrd(args) //.sort(compareDsc)

		//VALIDATION
		var newW = list.array.reduce(function(r, v) { return r+v.w }, 0)
		if (sizeW !== newW) throw Error('Wrong Weight. was '+sizeW+' now '+newW)

		//console.log('NEW VALUES:', vs)
		vs.forEach(function(v) { sizeW += v.w	})



		//cheap and nasty temp algorithm
		var allData = list.array.concat(vs).sort(compareAsc)
		var wi = 0
		var tempW = 0
		//if (allData.length < 4) return list.array = allData //no merging of ends...
		//console.log('START',allData)
		list.array = allData.reduce(function(res, crd, idx, all) {
			wi += crd.w

			//leave the end nodes alone
			if (idx < 2 || idx === all.length-1) return res.concat(crd)

			var last = res[res.length-1]
			if (crd.v === last.v) res[res.length-1] = last.copy().merge(crd)//, console.log('merge same value')
			else if (maxWeight(wi - 3*crd.w/2) > (last.w + crd.w)) res[res.length-1] = last.copy().merge(crd)//, console.log('merge with previous')
			else res.push(crd)

			var temp = res.reduce(function(r, v) { return r+v.w }, 0)
			if (temp !== wi) console.log('wi: ', wi, 'res:', temp, 'itm:', crd, 'idx:', idx, 'all:', all)
			//console.log(wi, idx, res.length)
			return res
		}, [])
		//VALIDATION
		newW = list.array.reduce(function(r, v) { return r+v.w }, 0)
		if (sizeW !== newW) {
			console.log(list.array)
			throw Error('Wrong Weight. was '+sizeW+' then '+wi+' now '+newW)
		}
		//console.log('END',allData)
	}
}

//TODO don't modify source arrays
var tst1 = [8,9,0,3,2,1,4,5,6,7]
var tst2 = [11, 12, 13, 19, 17, 18, 16, 15, 14, 10]
var tst3 = new Ctrd(5.3, 10)
var tst4 = [new Ctrd(8.3, 10)]
var tst5 = [3.5, new Ctrd(6.3, 8), 12.5]
var lots = tst1.concat(tst2, tst3, tst4, tst5)
var q = new Quant(25)
q.insert(tst1)
console.log('RESULT N10, W10: ',q.size.N, q.size.W)
q.insert(tst2)
console.log('RESULT N20, W20: ',q.size.N, q.size.W)
q.insert(tst3)
console.log('RESULT N21, W30: ',q.size.N, q.size.W)
q.insert(tst4)
console.log('RESULT N22, W40: ',q.size.N, q.size.W)
q.insert(tst5)
console.log('RESULT N25, W50: ',q.size.N, q.size.W)
q.insert(tst1)
console.log('RESULT N35, W60: ',q.size.N, q.size.W)
q.insert(tst2)
console.log('RESULT N45, W70: ',q.size.N, q.size.W)
q.insert(tst3)
console.log('RESULT N46, W80: ',q.size.N, q.size.W)
q.insert(tst4)
console.log('RESULT N47, W90: ',q.size.N, q.size.W)
q.insert(tst5)
console.log('RESULT N50, W100: ',q.size.N, q.size.W)
q.insert(lots)
console.log('RESULT N75, W150: ',q.size.N, q.size.W)
q.insert(lots)
console.log('RESULT N100, W200: ',q.size.N, q.size.W)

console.log(q.list.array.map(function(c){ return c.w.toFixed(1) }).join(', '))

for (var z=0, rnd=[]; z<400; ++z) rnd.push(Math.random()*30)
q.insert(rnd)
console.log('RESULT N500, W600: ',q.size.N, q.size.W)
q.insert(rnd)
console.log('RESULT N900, W1000: ',q.size.N, q.size.W)

