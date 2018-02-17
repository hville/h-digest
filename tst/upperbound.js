var c = require('cotest'),
		uV = require('../src/upperbound-v'),
		uS = require('../src/upperbound-s')

var vs = [0,0,1,1,4,4],
		ds = [0,0,1,0,3,0]

c('upperbound-s: v[i] >= v', function() {
	c('==', uV(vs, -1), 0)
	c('==', uV(vs, 0), 0)
	c('==', uV(vs, 0.5), 2)
	c('==', uV(vs, 1), 2)
	c('==', uV(vs, 1.5), 4)
	c('==', uV(vs, 4), 4)
	c('==', uV(vs, 4.5), 6)
})

c('upperbound-d: ∑[i] >= v', function() {
	c('==', uS(ds, -1), 0)
	c('==', uS(ds, 0), 0)
	c('==', uS(ds, 0.5), 2)
	c('==', uS(ds, 1), 2)
	c('==', uS(ds, 1.5), 4)
	c('==', uS(ds, 4), 4)
	c('==', uS(ds, 4.5), 6)
})
