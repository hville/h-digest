/* eslint no-console:0 */
var tdigest = require('tdigest')
var hdigest = require('../h-digest')

var N = 10000,
		M = 30,
		rands = []

//arbitrary non-linear skewed samples
for (var i=0; i<N; ++i) {
	rands.push( (Math.random() - Math.random()) * Math.random() * 100)
}

var samples = {
	float: rands,
	discrete: rands.map(Math.floor),
	sorted: rands.slice().sort(sorter),
	reverse: rands.slice().sort(sorter).reverse()
}
var td = {
	float: new tdigest.TDigest(0.8, M, 1.1),
	discrete: new tdigest.TDigest(0.8, M, 1.1),
	sorted: new tdigest.TDigest(0.8, M, 1.1),
	reverse: new tdigest.TDigest(0.8, M, 1.1)
}
var hd = {
	float: new hdigest(M),
	discrete: new hdigest(M),
	sorted: new hdigest(M),
	reverse: new hdigest(M)
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
	console.log('tdigest time:', time(oneByOne(td[k], 'push'), samples[k]).toFixed(0))
	console.log('hdigest time:', time(oneByOne(hd[k], 'push'), samples[k]).toFixed(0))
})
console.log('\n\n=== Errors ===')
console.log('target percents: ', percentages.join(', '))
Object.keys(samples).forEach(function(k) {
	console.log('\n== ', k ,' ==')
	console.log('tdigest ', qtls(td[k], 'percentile', percentages, actuals[k]))
	console.log('hdigest ', qtls(hd[k], 'percentile', percentages, actuals[k]))
})
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
function qtls(obj, prop, qs, ref) {
	var sumsq = 0
	var dif = qs.map(function(q, k) {
		var e = obj[prop](q) - ref[k]
		sumsq += e*e
		return e
	})
	return 'RMS:' + (Math.sqrt(sumsq)/qs.length).toFixed(2) + ', Err:' + dif.map(function(v) {
		return (v*100).toFixed(2) }
	).join(', ')
}
