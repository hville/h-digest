/* eslint no-console:0 */
var tdigest = require('tdigest')
var hdigest = require('../h-digest')
var normz = require('random-z')

var N = 10000,
		M = 30,
		rands = [],
		norms = []

for (var i=0; i<N; ++i) {
	norms.push(normz())
	//arbitrary non-linear skewed samples
	rands.push( (Math.random() - Math.random()) * Math.random() * 100)
}

var samples = {
	float: rands,
	norms: norms,
	discrete: rands.map(Math.floor),
	sorted: rands.slice().sort(sorter),
	reverse: rands.slice().sort(sorter).reverse()
}
var td = Object.keys(samples).reduce(function(r, k){
	r[k] = new tdigest.TDigest(0.8, M, 1.1)
	return r
}, {})
var hd = Object.keys(samples).reduce(function(r, k){
	r[k] = new hdigest(M)
	return r
}, {})
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
	console.log('tdigest time:', time(oneByOne(td[k], 'push'), samples[k]).toFixed(0))
	console.log('hdigest time:', time(oneByOne(hd[k], 'push'), samples[k]).toFixed(0))
})
console.log('\n\n=== Errors ===')
console.log('target percents: ', percentages.join(', '))
Object.keys(samples).forEach(function(k) {
	console.log('\n== ', k ,' ==')
	console.log('tdigest ', qtls(td, k, 'percentile', percentages, actuals[k]))
	console.log('hdigest ', qtls(hd, k, 'percentile', percentages, actuals[k]))
})
console.log('\n== ALL ==')
console.log('tdigest ', errStr(td.bias, td.sumsq, td.count))
console.log('hdigest ', errStr(hd.bias, hd.sumsq, hd.count))
console.log('\n\n=== END ===\n')

function sorter(a, b) {
	return a-b
}
function actualQuantile(arr, q) {
	return arr[Math.round((N-1)*q)]
}
function time(fcn, val) {
	var start = process.hrtime()
	fcn(val)
	var end = process.hrtime()
	return (end[0]-start[0])*1000000 + (end[1]-start[1])/1000
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
