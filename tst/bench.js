/* eslint no-console:0 */
var tdigest = require('tdigest')
var hdigest = require('../h-digest')

var N = 15001
for (var i=0, rnd=[]; i<N; ++i) {
	var rand = ((Math.random()+Math.random()-1) * Math.random() * 100)
	rnd.push(rand)
}
var td0 = new tdigest.TDigest(0.8, 24, 1.1) //this.size() > this.K / this.delta
var td1 = new tdigest.TDigest(0.8, 24, 1.1)
var hd0 = new hdigest(24)
var hd1 = new hdigest(24)

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

//console.profile('build')
console.log('pushTime')
console.log('tdigest - oneByone: ', time(oneByOne(td0, 'push'), rnd).toFixed(0), td0.size())
console.log('tdigest - allAtOnce: ', time(allAtOnce(td1, 'push'), rnd).toFixed(0), td1.size())
console.log('hdigest - oneByone: ', time(oneByOne(hd0, 'push'), rnd).toFixed(0), hd0.ranks.length)
console.log('hdigest - allAtOnce: ', time(allAtOnce(hd1, 'push'), rnd).toFixed(0), hd1.ranks.length)
//console.profileEnd('build')


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
		var e = obj[prop](q) - ref[k]
		console.log(qu)
		sumsq += e*e
		return e
	})
	var str = dif.map(function(v) { return (v*100).toFixed(2) }).join(', ')
	str += ' RMS:' + (Math.sqrt(sumsq)/qs.length).toFixed(2)
	return str
}

console.log('td0', qtls(td0, 'percentile', quantiles, actual))
console.log('td1', qtls(td1, 'percentile', quantiles, actual))
console.log('hd0', qtls(hd0, 'quantile', quantiles, actual))
console.log('hd1', qtls(hd1, 'quantile', quantiles, actual))
