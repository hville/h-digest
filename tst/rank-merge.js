var c = require('cotest'),
		E = require('../src/average'),
		merge = require('../src/rank-merge')

function test(v, j, vs, rs) {
	var N = rs[rs.length-1],
			E0 = E(vs, rs),
			E1 = (E0 * N + v) / (N + 1)
	merge(vs, rs, j, v)
	c('===', E(vs, rs), E1)
}

c('merge', function() {
	test(1, 1, [0,1,2], [1,2,3])
	test(3, 1, [0,1,9], [1,2,3])
	test(5, 1, [0,1,9], [1,5,10])
})
