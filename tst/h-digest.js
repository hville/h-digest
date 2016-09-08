/* eslint no-console:0 */
var c = require('cotest')
var HD = require('../h-digest')

function rankProb(v, i, a) { return toPercent(v/a[a.length-1]) }
function toPercent(v) { return (v*100).toFixed(1) }

c('len = 4, some identical values, non compressed', function() {
	var hd = HD(4)
	hd.push([1,2,3])
	//console.log('maxima:', hd.maxima, 'ranks:', hd.ranks, 'N:', hd.N)
	c('==', hd.ranks.length, 3)
	c('==', hd.N, 3)
	c('==', hd.maxima.length, 3)
	c('==', hd.quantile(0.5), 2)

	hd.push(2)
	//console.log('maxima:', hd.maxima, 'ranks:', hd.ranks, 'N:', hd.N)
	c('==', hd.ranks.length, 4)
	c('==', hd.N, 4)
	c('==', hd.maxima.length, 4)
	c('==', hd.quantile(0), 1)
	c('==', hd.quantile(0.5), 2)
	c('==', hd.quantile(1), 3)
})
c('len = 4, compressed, sorted (all new max)', function() {
	var hd = HD(4)
	hd.push([0,1,2,3,4])
	console.log('maxima:', hd.maxima, 'ranks:', hd.ranks, 'N:', hd.N)
	c('==', hd.ranks.length, 4)
	c('==', hd.N, 5)
	c('==', hd.maxima.length, 4)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5)-2), 0.25)
	c('==', hd.quantile(1), 4)
})
c('len = 4, reverse sorted (all new min)', function() {
	var hd = HD(4)
	hd.push([4,3,2,1,0])
	console.log('maxima:', hd.maxima, 'ranks:', hd.ranks, 'N:', hd.N)
	c('==', hd.ranks.length, 4)
	c('==', hd.N, 5)
	c('==', hd.maxima.length, 4)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5)-2), 0.25)
	c('==', hd.quantile(1), 4)
})
c('len = 4, mix-min-max', function() {
	var hd = HD(4)
	hd.push([2,1,3,4,0])
	console.log('maxima:', hd.maxima, 'ranks:', hd.ranks, 'N:', hd.N)
	c('==', hd.ranks.length, 4)
	c('==', hd.N, 5)
	c('==', hd.maxima.length, 4)
	c('==', hd.quantile(0), 0)
	c('==', hd.quantile(0.5), 2)
	c('==', hd.quantile(1), 4)
})
c('len = 5, 19 sorted', function() {
	var m = 5,
			n = 101,
			hd = HD(m)
	for (var i=0; i<n; ++i) hd.push(i)
	console.log('maxima:', hd.maxima, 'ranks:', hd.ranks)
	console.log('probs:', hd.probs.map(toPercent), 'actual:', hd.ranks.map(rankProb))
	c('==', hd.ranks.length, m)
	c('==', hd.N, n)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5) - (n-1)/2), 0.5)
	c('==', hd.quantile(1), n-1)
}, true)
c('len = 5, 9 rev-sorted', function() {
	var m = 5,
			n = 101,
			hd = HD(m)
	for (var i=0; i<n; ++i) hd.push(n-i-1)
	console.log('maxima:', hd.maxima, 'ranks:', hd.ranks)
	console.log('probs:', hd.probs.map(toPercent), 'actual:', hd.ranks.map(rankProb))
	c('==', hd.ranks.length, m)
	c('==', hd.N, n)
	c('==', hd.quantile(0), 0)
	c('<=', Math.abs(hd.quantile(0.5) - (n-1)/2), 0.5)
	c('==', hd.quantile(1), n-1)
}, true)
