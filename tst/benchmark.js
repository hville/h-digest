/* eslint no-console:0 */
var tdigest = require('tdigest'),
		createWeights = require('../src/weighting'),
		CDF = require('../src/_cdf'),
		iZ = require('norm-dist/icdf')

var N = 20000,
		M = 27,
		unif = mapRep(N, function() { return Math.random() * 100 }),
		norm = mapRep(N, function() { return iZ(Math.random()) * 100 }),
		logp = mapRep(N, function() { return Math.exp(iZ(Math.random())+0.5) * 100 }),
		weights = createWeights(M)

var samples = {
	logp: logp,
	logn: logp.map(function(v) { return -v }),
	norm: norm,
	disc: norm.map(Math.floor),
	sort: unif.slice().sort(sorter),
	rvrs: unif.slice().sort(sorter).reverse()
}
var fcn = {
	td1: Object.keys(samples).reduce(function(r, k){
		r[k] = new tdigest.TDigest(0.8, M, 1.1)
		return r
	}, {}),
	cdf: Object.keys(samples).reduce(function(r, k){
		r[k] = new CDF(weights)
		return r
	}, {})
}
var percentages = [0.005, 0.02, .1, .25, .5, .75, .98, .995],
		actuals = Object.keys(samples).reduce(function(r, k) {
			r[k] = percentages.map(function(p) { return actualQuantile(samples[k].slice().sort(sorter), p)})
			return r
		}, {})

//console.profile('build')
console.log('\n\n=== Push Times ==')
console.log('%d samples, %d max size', N, M)
Object.keys(samples).forEach(function(k) {
	console.log('\n== ', k ,' ==')
	Object.keys(fcn).forEach(function(fk) {
		var t = time(oneByOne(fcn[fk][k], 'push'), samples[k])
		fcn[fk].time = fcn[fk].time ? fcn[fk].time + t : t
		console.log(fk, 'time:', t)
	})
})

console.log('\n== combined times ==')
Object.keys(fcn).forEach(function(fk) {
	console.log(fk, 'time:', fcn[fk].time.toFixed(0))
})

console.log('\n\n=== Errors ===')
console.log('target percents: ', percentages.join(', '))
Object.keys(samples).forEach(function(k) {
	console.log('\n== ', k ,' ==')
	Object.keys(fcn).forEach(function(fk) {
		console.log(fk, qtls(fcn[fk], k, 'percentile', percentages, actuals[k]))
	})
})

console.log('\n== ALL ==')
Object.keys(fcn).forEach(function(fk) {
	console.log(fk, errStr(fcn[fk].bias, fcn[fk].sumsq, fcn[fk].count))
})
console.log('\n\n=== END ===\n')

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
function time(fn, val) {
	var start = process.hrtime()
	fn(val)
	var end = process.hrtime()
	return (end[0]-start[0])*1e6 + (end[1]-start[1])/1000
}
function oneByOne(obj, mtd) {
	return function(rs) {
		for (var j=0; j<rs.length; ++j) obj[mtd](rs[j])
	}
}
function qtls(obj, key, prop, qs, ref) {
	var sum = 0,
			sumsq = 0
	var dif = qs.map(function(q, k) {
		var e = obj[key][prop](q) - ref[k]
		sum += e
		sumsq += e*e
		return e
	})
	var bias = sum/qs.length
	if (obj.bias === undefined) obj.bias = bias
	else bias += bias
	if (obj.sumsq === undefined) obj.sumsq = sumsq
	else obj.sumsq += sumsq
	if (obj.count === undefined) obj.count = 1
	else obj.count++

	return errStr(bias, sumsq, qs.length) + ', Err:' + dif.map(function(v) {
		return (v*100).toFixed(2) }
	).join(', ')
}
function errStr(bias, sumsq, count) {
	return 'Bias:' + bias.toFixed(2) + ' RMS:' + (Math.sqrt(sumsq)/count).toFixed(2)
}
