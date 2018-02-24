var c = require('cotest'),
		E = require('../src/average'),
		insertRank = require('../src/rank-insert'),
		incrementAfter = require('../src/increment-after'),
		upperbound = require('../src/upperbound')

function test(vs, rs, v) {
	var j = upperbound(vs, v),
			M = rs.length,
			N = rs[M-1],
			E0 = E(vs, rs),
			E1 = (E0 * N + v) / (N + 1),
			R = insertRank(vs, rs, j, v)
	vs.splice(j,0,v)
	rs.splice(j,0,R)
	incrementAfter(rs, j)
	c('===', E(vs, rs), E1)
}

c('insert', function() {
	test([1,2,3,4], [1,2,3,4], 1.5)
	test([1,2,3,4], [1,2,3,4], 1.7)
	test([1,2,3,4], [1,2,3,4], 2)
	test([1,2,3,4], [1,2,3,4], 2.5)

	test([1,2,3,4], [1,3,5,7], 1.5)
	test([1,2,3,4], [1,3,5,7], 1.7)
	test([1,2,3,4], [1,3,5,7], 2)
	test([1,2,3,4], [1,3,5,7], 2.5)
})
