/* eslint no-console:0 */
var t = require('cotest')
var Quant = require('../minidigest')

t('grows up to defined size', function() {
	var q5 = Quant(5)
	var q17 = Quant(17)

	t('==',q5.N, 0)
	t('==',q17.N, 0)
	t('==',q5.size, 0)
	t('==',q17.size, 0)

	q5.push(1)
	q17.push(1)

	t('==',q5.N, 1)
	t('==',q17.N, 1)
	t('==',q5.size, 1)
	t('==',q17.size, 1)

	q5.push([5,4,3,2,0])
	q17.push([5,4,3,2,0])

	t('==',q5.size, 5)
	t('==',q5.N, 6)
	t('==',q17.size, 6)

	t('==',q5.quantile(0), 0)
	t('==',q17.quantile(0.5), 2.5)
	t('==',q5.quantile(1), 5)

	q5.push([6,7,8,9])
	q17.push([6,7,8,9])

	t('==',q5.size, 5)
	t('==',q5.N, 10)
	t('==',q17.N, 10)
	t('==',q17.size, 10)

	t('==',q5.quantile(0), 0)
	t('==',q5.quantile(0.5), 4.5)
	t('==',q17.quantile(0.5), 4.5)
	t('==',q5.quantile(1), 9)

	q5.push([14,13,12,11,10])
	q17.push([14,13,12,11,10])

	t('==',q5.size, 5)
	t('==',q17.N, 15)
	t('==',q5.N, 15)
	t('==',q17.size, 15)

	t('==',q5.quantile(0.5), 7)
	t('==',q17.quantile(0.5), 7)
})


t('sdfsdfsdf', function() {
	function closeTo(a, b, d) {
		t('<', Math.abs(a-b), d)
	}

	var q23 = Quant(23)
	var q25 = Quant(25)

	var N = 5001
	for (var i=0, rnd=[]; i<N; ++i) {
		var rand = Math.random()
		rnd.push(rand)
		q23.push(rand)
	}
	q25.push(rnd)

	rnd.sort(function(a,b) { return a-b })
	var max = rnd[N-1]
	var Q90 = rnd[Math.round((N-1)*0.9)]
	var Q75 = rnd[Math.round((N-1)*0.75)]
	var Q50 = rnd[Math.round((N-1)*0.5)]
	var Q25 = rnd[Math.round((N-1)*0.25)]
	var Q10 = rnd[Math.round((N-1)*0.10)]
	var min = rnd[0]

	closeTo(q23.quantile(0.5), Q50, 5e-3)//
	closeTo(q25.quantile(0.25), Q25, 5e-3)

	closeTo(q23.quantile(0.75), Q75, 5e-3)//
	closeTo(q25.quantile(0.10), Q10, 5e-3)
	closeTo(q25.quantile(0.90), Q90, 5e-3)

	t('==',q23.max, max)
	t('==',q25.min, min)

})

