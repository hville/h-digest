/* eslint no-console:0 */

var Quant = require('../index')
var t = require('assert')

function closeTo(a, b, d, msg) {
	t.ok(Math.abs(a-b) < d, msg || a + ' !=~ ' + b)
}

var q5 = Quant({
	maximumSize: 9,
	nominalSize: 5
})
//console.log('proto', Object.keys(q5.prototype))
//q5.dummy()

var q17 = Quant()

t.equal(q5.N, 0)
t.equal(q17.N, 0)
t.equal(q5.size, 0)
t.equal(q17.size, 0)

q5.insert(1)
q17.insert(1)

t.equal(q5.N, 1)
t.equal(q17.N, 1)
t.equal(q5.size, 1)
t.equal(q17.size, 1)

q5.insert([5,4,3,2,0])
q17.insert([5,4,3,2,0])

t.equal(q5.size, 5)
t.equal(q5.N, 6)
t.equal(q17.size, 6)

t.equal(q5.quantile(0), 0)
t.equal(q17.quantile(0.5), 2.5)
t.equal(q5.quantile(1), 5)

q5.insert([6,7,8,9])
q17.insert([6,7,8,9])

t.equal(q5.size, 5)
t.equal(q5.N, 10)
t.equal(q17.N, 10)
t.equal(q17.size, 10)

t.equal(q5.quantile(0), 0)
t.equal(q5.quantile(0.5), 4.5)
t.equal(q17.quantile(0.5), 4.5)
t.equal(q5.quantile(1), 9)

q5.insert([14,13,12,11,10])
q17.insert([14,13,12,11,10])

t.equal(q5.size, 5)
t.equal(q17.N, 15)
t.equal(q5.N, 15)
t.equal(q17.size, 15)

t.equal(q5.quantile(0.5), 7)
t.equal(q17.quantile(0.5), 7)

var q23 = Quant({
	maximumSize: 30,
	nominalSize: 23
})
var q25 = Quant({
	maximumSize: 35,
	nominalSize: 25
})

var N = 5001
for (var i=0, rnd=[]; i<N; ++i) {
	var rand = Math.random()
	rnd.push(rand)
	q23.insert(rand)
}
q25.insert(rnd)

rnd.sort(function(a,b) { return a-b })
var max = rnd[N-1]
var Q90 = rnd[Math.round((N-1)*0.9)]
var Q75 = rnd[Math.round((N-1)*0.75)]
var Q50 = rnd[Math.round((N-1)*0.5)]
var Q25 = rnd[Math.round((N-1)*0.25)]
var Q10 = rnd[Math.round((N-1)*0.10)]
var min = rnd[0]

closeTo(q23.quantile(0.5), Q50, 5e-3)
closeTo(q25.quantile(0.25), Q25, 5e-3)

closeTo(q23.quantile(0.75), Q75, 5e-3)
closeTo(q25.quantile(0.10), Q10, 5e-3)
closeTo(q25.quantile(0.90), Q90, 5e-3)

t.equal(q23.max, max)
t.equal(q25.min, min)

console.log('===Test Complete===')
//console.log(q11.N)
//console.log(q11.array.map(function(c) {return c[0].toFixed(2) + '-'+ c[1]}))
//console.log(q17.array.map(function(c) {return c[0].toFixed(2) + '-'+ c[1]}))

