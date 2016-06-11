/* eslint no-console:0 */
var Quant = require('../index')
var tdigest = require('tdigest')

var N = 10001
for (var i=0, rnd=[]; i<N; ++i) {
	var rand = (Math.random()-0.5)*Math.random() * 100
	rnd.push(rand)
}

var qt0 = Quant({
	maximumSize: 35,
	nominalSize: 21
})

var qt1 = Quant({
	maximumSize: 35,
	nominalSize: 21
})

var td0 = new tdigest.TDigest(0.8, 24, 1.1) //this.size() > this.K / this.delta
var td1 = new tdigest.TDigest(0.8, 24, 1.1)

function time(fcn, val) {
	var start = process.hrtime()
	fcn(val)
	var end = process.hrtime()
	return (end[0]-start[0])*1000000 + (end[1]-start[1])/1000
}

function oneByOne(obj, mtd) {
	return function(rs) {
		rs.forEach(function(v) {obj[mtd](v)})
	}
}

function allAtOnce(obj, mtd) {
	return function(rs) {
		obj[mtd](rs)
	}
}


console.log('pushTime')
console.log('tdigest - oneByone: ', time(oneByOne(td0, 'push'), rnd).toFixed(0), td0.size())
console.log('tdigest - allAtOnce: ', time(allAtOnce(td1, 'push'), rnd).toFixed(0), td1.size())
console.log('quant - oneByone: ', time(oneByOne(qt0, 'push'), rnd).toFixed(0), qt0.size)
console.log('quant - allAtOnce: ', time(allAtOnce(qt1, 'push'), rnd).toFixed(0), qt1.size)

function err(val, ref) { return (val-ref)/ref }

console.log('errors')
rnd.sort(function(a,b) { return a-b })

function actualQuantile(q) {
	return rnd[Math.round((N-1)*q)]
}

var quantiles = [0.005, 0.02, .1, .25, .5, .75, .98, .995]
var actual = quantiles.map(actualQuantile)

function qtls(obj, prop, qs, ref) {
	var sumsq = 0
	var dif = qs.map(function(q, k) {
		var e = err(obj[prop](q), ref[k])
		sumsq += e*e
		return e
	})
	dif.push(Math.sqrt(sumsq/qs.length))
	return dif.map(function(v) { return (v*100).toFixed(2) }).join(', ')
}

console.log('td0', qtls(td0, 'percentile', quantiles, actual))
console.log('td1', qtls(td1, 'percentile', quantiles, actual))
console.log('qt0', qtls(qt0, 'quantile', quantiles, actual))
console.log('qt0', qtls(qt0, 'quantile', quantiles, actual))

console.log(qt0.data.arr)
