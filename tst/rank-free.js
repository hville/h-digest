var c = require('cotest'),
		E = require('../src/average'),
		freeRank = require('../src/rank-free')

function test(vs, rs, k) {
	var E0 = E(vs, rs)
	freeRank(vs, rs, k)
	vs.splice(k, 1)
	rs.splice(k, 1)
	c('===', E(vs, rs), E0)
}

c('insert', function() {
	test([1,2,3,4,5], [1,2,3,4,5], 2)

	test([1,2,3,5,6], [1,2,3,5,6], 2)
	test([1,2,3,5,6], [1,2,4,5,6], 2)
	test([1,2,4,5,6], [1,2,3,5,6], 2)
	test([1,2,4,5,6], [1,2,4,5,6], 2)
})
