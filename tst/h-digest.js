var c = require('cotest')
var HD = require('../')

c('general properties, methods and getters', function() {
	var hd = HD([10,15,10])
	hd.push(4)
	hd.push([5,3,6,2,7,1,8])
	hd.push([0])
	c('==', hd.min, 0)
	c('==', hd.max, 8)//
	c('==', hd.N, 9)
	c('==', hd.ranks.length, 5)
	c('==', hd.values.length, 5)
	c('==', hd.quantile(0), 0)
	c('{==}', hd.quantile([0]), [0])
	c('==', hd.quantile(0.5), 4)
	c('==', hd.quantile(1), 8)//
})
c('len = 5, some identical values, non compressed', function() {
	var hd = HD(5)
	hd.push([1,2,3])
	c('==', hd.ranks.length, 3)
	c('==', hd.values.length, 3)
	c('==', hd.quantile(0.5), 2)

	hd.push(2)
	c('==', hd.ranks.length, 4)
	c('==', hd.values.length, 4)
	c('==', hd.quantile(0), 1)
	c('==', hd.quantile(0.5), 2)
	c('==', hd.quantile(1), 3)
	hd.push(2)
	c('==', hd.ranks.length, 5)
	c('==', hd.values.length, 5)
	c('==', hd.quantile(0), 1)
	c('==', hd.quantile(0.5), 2)
	c('==', hd.quantile(1), 3)

})
c('len = 5, compressed, sorted (all new max)', function() {
	var hd = HD(5)
	hd.push([0,1,2,3,4,5,6,7,8])
	c('==', hd.ranks.length, 5)
	c('==', hd.values.length, 5)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5)-4), 0.1)
	c('==', hd.quantile(1), 8)
})
c('len = 5, reverse sorted (all new min)', function() {
	var hd = HD(5)
	hd.push([8,7,6,5,4,3,2,1,0])
	c('==', hd.ranks.length, 5)
	c('==', hd.values.length, 5)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5)-4), 0.1)
	c('==', hd.quantile(1), 8)
})
c('len = 5, mix-min-max', function() {
	var hd = HD(5)
	hd.push([4,5,3,6,2,7,1,8,0])
	c('==', hd.ranks.length, 5)
	c('==', hd.values.length, 5)
	c('==', hd.quantile(0), 0)
	c('==', hd.quantile(0.5), 4)
	c('==', hd.quantile(1), 8)
})
c('len = 9, 101 sorted', function() {
	var m = 9,
			n = 99,
			hd = HD(m)
	for (var i=0; i<n; ++i) hd.push(i)
	c('==', hd.ranks.length, m)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5) - (n-1)/2), 0.01)
	c('==', hd.quantile(1), n-1)
})
c('len = 9, 101 reversed', function() {
	var m = 9,
			n = 99,
			hd = HD(m)
	for (var i=0; i<n; ++i) hd.push(n-i-1)
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
	rnd.sort(function(a, b) {return a-b})
	c('==', hd.ranks.length, m)
	c('==', hd.quantile(0), rnd[0])
	c('<=', Math.abs(hd.quantile(0.5) - rnd[(n+1)/2]), 0.025)
	c('==', hd.quantile(1), rnd[n-1])
})
c('skewed random, m=9, n=1000', function() {
	var m = 9,
			n = 1001,
			hd = HD(m),
			rnd = []
	for (var i=0; i<n; ++i) rnd.push(Math.random()+Math.random()*Math.random())
	hd.push(rnd)

	rnd.sort(function(a, b) {return a-b})
	c('==', hd.ranks.length, m)
	c('==', hd.quantile(0), rnd[0])
	c('<=', Math.abs(hd.quantile(0.5) - rnd[(n+1)/2]), 0.025)
	c('==', hd.quantile(1), rnd[n-1])
})
c('lots of repeated values n=9, n=1000', function() {
	var m = 9,
			n = 1001,
			hd = HD(m),
			rnd = []
	for (var i=0; i<n; ++i) rnd.push(Math.random() < 0.25 ? 0 : Math.random()*Math.random())
	hd.push(rnd)
	rnd.sort(function(a, b) {return a-b})
	c('==', hd.ranks.length, m)
	c('==', hd.quantile(0), rnd[0])
	c('<=', Math.abs(hd.quantile(0.5) - rnd[(n+1)/2]), 0.025)
	c('==', hd.quantile(1), rnd[n-1])
})
