var Quant = require('../index')
var t = require('assert')


var q5 = Quant({
	maximumSize: 9,
	nominalSize: 5
})

var q17 = Quant()

t.equal(q5.N, 0)
t.equal(q17.N, 0)
t.equal(q5.W, 0)
t.equal(q17.W, 0)

q5.insert(1)
q17.insert(1)

t.equal(q5.N, 1)
t.equal(q17.N, 1)
t.equal(q5.W, 1)
t.equal(q17.W, 1)

q5.insert([5,4,3,2,0])
q17.insert([5,4,3,2,0])

t.equal(q5.W, 6)
t.equal(q17.W, 6)

t.equal(q5.quantile(0), 0)
t.equal(q17.quantile(0.5), 2.5)
console.log(q5.array)
//t.equal(q5.quantile(1), 5)

q5.insert([6,7,8,9])
q17.insert([6,7,8,9])

t.equal(q5.N, 5)
t.equal(q17.N, 10)
t.equal(q5.W, 10)
t.equal(q17.W, 10)

//t.equal(q5.quantile(0), 0)
//t.equal(q5.quantile(0.5), 4.5)
//t.equal(q17.quantile(0.5), 4.5)
//t.equal(q5.quantile(1), 9)

q5.insert([14,13,12,11,10])
q17.insert([14,13,12,11,10])

t.equal(q5.N, 5)
t.equal(q17.N, 15)
t.equal(q5.W, 15)
t.equal(q17.W, 15)

//t.equal(q5.quantile(0.5), 7)
//t.equal(q17.quantile(0.5), 7)

var q7 = Quant({
	maximumSize: 13,
	nominalSize: 7
})
var q13b13 = Quant({
	maximumSize: 13,
	nominalSize: 13
})

var q13b17 = Quant({
	maximumSize: 17,
	nominalSize: 13
})
var q13b21 = Quant({
	maximumSize: 21,
	nominalSize: 13
})

var q11 = Quant({
	maximumSize: 27,
	nominalSize: 13
})

for (var i=0, rnd=[]; i<5000; ++i) {
	var rand = Math.random()
	//q17.insert(rand)
	rnd.push(rand)
	q13b21.insert(rand)
	q13b17.insert(rand)
	q13b13.insert(rand)
}
q5.insert(rnd)
q7.insert(rnd)
q13b21.compile().compile().compile()
q13b17.compile().compile().compile()
q13b13.compile().compile().compile()
q11.insert(rnd)

//console.log(q5.N)
//console.log(q5.array.map(function(c) {return c[0].toFixed(2) + '-'+ c[1]}))
//console.log(q7.N)
//console.log(q7.array.map(function(c) {return c[0].toFixed(2) + '-'+ c[1]}))

console.log(q13b21.N, q13b21.array.length)
console.log(q13b21.array.map(function(c) {return c[0].toFixed(2) + '-'+ c[1]}))

console.log(q13b17.N, q13b17.array.length)
console.log(q13b17.array.map(function(c) {return c[0].toFixed(2) + '-'+ c[1]}))

console.log(q13b13.N, q13b13.array.length)
console.log(q13b13.array.map(function(c) {return c[0].toFixed(2) + '-'+ c[1]}))

//console.log(q11.N)
//console.log(q11.array.map(function(c) {return c[0].toFixed(2) + '-'+ c[1]}))
//console.log(q17.array.map(function(c) {return c[0].toFixed(2) + '-'+ c[1]}))

