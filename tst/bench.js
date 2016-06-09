/* eslint no-console:0 */
var Quant = require('../index')
var tdigest = require('tdigest')

var N = 100001
for (var i=0, rnd=[]; i<N; ++i) {
	var rand = Math.random() * 100
	rnd.push(rand)
}

var qt0 = Quant({
	maximumSize: 72,
	nominalSize: 36
})

var qt1 = Quant({
	maximumSize: 72,
	nominalSize: 36
})

var td0 = new tdigest.TDigest(0.5, 27, 1.1) //this.size() > this.K / this.delta
var td1 = new tdigest.TDigest(0.5, 27, 1.1)

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
console.log('quant - oneByone: ', time(oneByOne(qt0, 'insert'), rnd).toFixed(0), qt0.size)
console.log('quant - allAtOnce: ', time(allAtOnce(qt1, 'insert'), rnd).toFixed(0), qt1.size)

function err(val, ref) { return (100*(val-ref)/ref).toFixed(1) }

console.log('errors')
rnd.sort(function(a,b) { return a-b })
var Q02 = rnd[Math.round((N-1)*0.02)]
var Q10 = rnd[Math.round((N-1)*0.1)]
var Q25 = rnd[Math.round((N-1)*0.25)]
//var Q50 = rnd[Math.round((N-1)*0.5)]

console.log('td0', err(td0.percentile(0.02), Q02), err(td0.percentile(0.10), Q10), err(td0.percentile(0.25), Q25))
console.log('td1', err(td1.percentile(0.02), Q02), err(td1.percentile(0.10), Q10), err(td1.percentile(0.25), Q25))
console.log('qt0', err(qt0.quantile(0.02), Q02), err(qt0.quantile(0.10), Q10), err(qt0.quantile(0.25), Q25))
console.log('qt1', err(qt1.quantile(0.02), Q02), err(qt1.quantile(0.10), Q10), err(qt1.quantile(0.25), Q25))
