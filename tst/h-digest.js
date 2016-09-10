/* eslint no-console:0 */
var c = require('cotest')
var HD = require('../h-digest')

c('internal methods', function() {
	var hd = HD(5)
	hd.push([4,3,2,1,0])
	hd.values = [0, 16, 50, 84, 100]
	hd.N = 101

	//MM
	hd.ranks = [1, 17, 53, 85, 101]
	c('==', hd.direction(2, 46), 0)
	c('==', hd.direction(2, 50), 1)
	//LL
	hd.ranks = [1, 11, 46, 85, 101]
	c('==', hd.direction(2, 45), 0)
	c('==', hd.direction(2, 12), -1)
	//LH
	hd.ranks = [1, 11, 56, 85, 101]
	c('==', hd.direction(2, 52), 1)
	c('==', hd.direction(2, 12), -1)
	//HIGH
	hd.ranks = [1, 17, 61, 85, 101]
	c('==', hd.direction(2, 51), 1)
})
c('len = 4, some identical values, non compressed', function() {
	var hd = HD(5)
	hd.push([1,2,3])
	//console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	c('==', hd.ranks.length, 3)
	c('==', hd.values.length, 3)
	c('==', hd.quantile(0.5), 2)

	hd.push(2)
	console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	c('==', hd.ranks.length, 4)
	c('==', hd.values.length, 4)
	c('==', hd.quantile(0), 1)
	c('==', hd.quantile(0.5), 2)
	c('==', hd.quantile(1), 3)
	hd.push(2)
	console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	c('==', hd.ranks.length, 5)
	c('==', hd.values.length, 5)
	c('==', hd.quantile(0), 1)
	c('==', hd.quantile(0.5), 2)
	c('==', hd.quantile(1), 3)

})
c('len = 4, compressed, sorted (all new max)', function() {
	var hd = HD(4)
	hd.push([0,1,2,3,4])
	console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	c('==', hd.ranks.length, 4)
	c('==', hd.values.length, 4)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5)-2), 0.1)
	c('==', hd.quantile(1), 4)
	hd.push([5,6,7,8])
	//console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	c('==', hd.ranks.length, 4)
	c('==', hd.values.length, 4)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5)-4), 0.1)
	c('==', hd.quantile(1), 8)
})
c('len = 4, reverse sorted (all new min)', function() {
	var hd = HD(4)
	hd.push([8,7,6,5,4])
	//console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	c('==', hd.ranks.length, 4)
	c('==', hd.values.length, 4)
	c('==', hd.quantile(0), 4)
	c('<=', Math.abs(hd.quantile(0.5)-6), 0.1)
	c('==', hd.quantile(1), 8)
	hd.push([3,2,1,0])
	console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	c('==', hd.ranks.length, 4)
	c('==', hd.values.length, 4)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5)-4), 0.1)
	c('==', hd.quantile(1), 8)
})
c('len = 4, mix-min-max', function() {
	var hd = HD(4)
	hd.push([2,1,3,4,0])
	//console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	c('==', hd.ranks.length, 4)
	c('==', hd.values.length, 4)
	c('==', hd.quantile(0), 0)
	c('==', hd.quantile(0.5), 2)
	c('==', hd.quantile(1), 4)
})
c('len = 5, 19 sorted', function() {
	var m = 5,
			n = 19,
			hd = HD(m)
	for (var i=0; i<n; ++i) hd.push(i)
	//console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	//console.log('probs:', hd.probs.map(toPercent), 'actual:', hd.ranks.map(rankProb))
	c('==', hd.ranks.length, m)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5) - (n-1)/2), 0.01)
	c('==', hd.quantile(1), n-1)
})
c('len = 5, 19 reversed', function() {
	var m = 5,
			n = 19,
			hd = HD(m)
	for (var i=0; i<n; ++i) hd.push(n-i-1)
	//console.log('maxima:', hd.values, 'ranks:', hd.ranks)
	//console.log('probs:', hd.probs.map(toPercent), 'actual:', hd.ranks.map(rankProb))
	c('==', hd.ranks.length, m)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5) - (n-1)/2), 0.01)
	c('==', hd.quantile(1), n-1)
})
c('uniform random, m=9, n=1000', function() {
	var m = 9,
			n = 1001,
			hd = HD(m),
			rnd = []
	for (var i=0; i<n; ++i) rnd.push(Math.random())
	hd.push(rnd)
	console.log('low:', hd.ranks.slice(0,4))
	console.log('high:', hd.ranks.slice(-4))
	rnd.sort(function(a, b) {return a-b})
	c('==', hd.ranks.length, m)
	c('==', hd.quantile(0), rnd[0])
	c('<=', Math.abs(hd.quantile(0.5) - rnd[(n+1)/2]), 0.025)
	c('==', hd.quantile(1), rnd[n-1])
}, true)
c('skewed random, m=9, n=1000', function() {
	var m = 9,
			n = 1001,
			hd = HD(m),
			rnd = []
	for (var i=0; i<n; ++i) rnd.push(Math.random()+Math.random()*Math.random())
	hd.push(rnd)
	console.log('low:', hd.ranks.slice(0,4))
	console.log('high:', hd.ranks.slice(-4))

	rnd.sort(function(a, b) {return a-b})
	c('==', hd.ranks.length, m)
	c('==', hd.quantile(0), rnd[0])
	c('<=', Math.abs(hd.quantile(0.5) - rnd[(n+1)/2]), 0.025)
	c('==', hd.quantile(1), rnd[n-1])
}, true)
c('lots of repeated values n=9, n=1000', function() {
	var m = 9,
			n = 1001,
			hd = HD(m),
			rnd = []
	for (var i=0; i<n; ++i) rnd.push(Math.random() < 0.25 ? 0 : Math.random()*Math.random())
	hd.push(rnd)
	console.log('low:', hd.ranks.slice(0,4))
	console.log('high:', hd.ranks.slice(-4))
	rnd.sort(function(a, b) {return a-b})
	c('==', hd.ranks.length, m)
	c('==', hd.quantile(0), rnd[0])
	c('<=', Math.abs(hd.quantile(0.5) - rnd[(n+1)/2]), 0.025)
	c('==', hd.quantile(1), rnd[n-1])
}, true)
