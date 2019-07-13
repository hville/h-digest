/* eslint no-console:0 */
var tdigest = require('tdigest'),
		createWeights = require('../src/weighting'),
		CDF = require('../src/_cdf'),
		iZ = require('norm-dist/icdf')

var N = 20000,
		M = 40,
		unif = mapRep(N, function() { return Math.random() * 100 }),
		norm = mapRep(N, function() { return iZ(Math.random()) * 100 }),
		logp = mapRep(N, function() { return Math.exp(iZ(Math.random())+0.5) * 100 }),
		weights = createWeights(40),
		percentages = [0.02, .1, .25, .5, .75, .98]

var samples = {
	logp: logp,
	logn: logp.map(function(v) { return -v }),
	norm: norm,
	disc: norm.map(Math.floor),
	sort: unif.slice().sort(sorter),
	rvrs: unif.slice().sort(sorter).reverse()
}
var sampleKeys = Object.keys(samples)

var fcns = {
	td1: sampleKeys.reduce(function(r, k){
		r[k] = new tdigest.TDigest(0.8, M, 1.1)
		return r
	}, {}),
	cdf: sampleKeys.reduce(function(r, k){
		r[k] = new CDF(weights)
		return r
	}, {})
}

var actuals = sampleKeys.reduce(function(r, k) {
	r[k] = percentages.map(function(p) { return actualQuantile(samples[k].slice().sort(sorter), p)})
	return r
}, {})

var fcnKeys = Object.keys(fcns)
fcnKeys.forEach( fk => {
	fcns[fk].bias = 0
	fcns[fk].sumsq = 0
})


function pushTime(rec, val) {
	var start = process.hrtime()
	for (var j=0; j<val.length; ++j) rec.push(val[j])
	var end = process.hrtime()
	return (end[0]-start[0])*1e6 + (end[1]-start[1])/1000
}


console.log('\n=== Push Times ==')
console.log('%d samples, %d max size', N, M)
sampleKeys.forEach(function(k) {
	console.log('== ', k ,' ==')
	fcnKeys.forEach(function(fk) {
		var t = pushTime(fcns[fk][k], samples[k])
		fcns[fk].time = fcns[fk].time ? fcns[fk].time + t : t
		console.log(fk, 'time:', t)
	})
})

console.log('\n== combined times ==')
fcnKeys.forEach(function(fk) {
	console.log(fk, 'time:', fcns[fk].time.toFixed(0))
})

console.log('\n=== Errors ===')
console.log('target percents: ', percentages.join(', '))
sampleKeys.forEach(function(sk) {
	console.log('== ', sk ,' ==')
	fcnKeys.forEach(function(fk) {
		console.log(fk, qtls(fcns[fk], sk, percentages, actuals[sk]))
	})
})

console.log('\n== ALL ==')
fcnKeys.forEach(function(fk) {
	console.log(fk, errStr(fcns[fk].bias, fcns[fk].sumsq, fcns[fk].count))
})
console.log('\n=== END ===\n')

// UTILS
function mapRep(n, f) {
	for (var i=0, r=Array(n); i<n; ++i) r[i] = f(n, i, r)
	return r
}
function sorter(a, b) {
	return a-b
}
function actualQuantile(arr, q) {
	return arr[Math.round((N-1)*q)]
}


function qtls(fcni, sampleKey, qs, ref) {
	var bias = 0,
			sumsq = 0
	var dif = qs.map(function(q, k) {
		var e = fcni[sampleKey].percentile(q) - ref[k]
		bias += e
		sumsq += e*e
		return e
	})
	fcni.bias += bias
	fcni.sumsq += sumsq

	return errStr(bias, sumsq, qs.length) + ', Err:' + dif.map(v => Math.floor(v*100).toString().padStart(6) ).join(', ')
}
function errStr(bias, sumsq) {
	var rms = ''+Math.floor(Math.sqrt(sumsq)),
			sum = ''+Math.floor(bias)
	return 'RMS:' + rms.padStart(5, ' ') + ', Bias:' + sum.padStart(5, ' ')
}
