var c = require('cotest'),
		E = require('../src/average')

c('average', function() {
	c('==', E([0,1,2], [1,2,3]), 1)
	c('==', E([-2,0,2], [1,2,3]), 0)
	c('==', E([-2,2,2,6], [1,2,3,4]), 2)
})
