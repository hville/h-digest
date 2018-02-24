var c = require('cotest'),
		shift = require('../src/shift')


function test(put, pop, src, ref) {
	var vs = src.slice(),
			rs = src.slice()
	shift(vs, rs, put, pop)
	c('{===}', vs, ref, ':'+src.length+put+pop)
	c('{===}', rs, ref, ':'+src.length+put+pop)
}

c('shift right', function() {
	var a5 = [0,1,2,3,4]
	test(0, 3, a5, [0,0,1,2,4])
	test(1, 3, a5, [0,1,1,2,4])
	test(2, 4, a5, [0,1,2,2,3])
	test(3, 4, a5, [0,1,2,3,3])
})
c('shift left', function() {
	var a5 = [0,1,2,3,4]
	test(3, 0, a5, [1,2,3,3,4])
	test(3, 1, a5, [0,2,3,3,4])
	test(4, 2, a5, [0,1,3,4,4])
	test(4, 3, a5, [0,1,2,4,4])
})
c('no shift', function() {
	var a5 = [0,1,2,3,4]
	test(0, 0, a5, [0,1,2,3,4])
	test(3, 3, a5, [0,1,2,3,4])
	test(4, 4, a5, [0,1,2,3,4])
})
