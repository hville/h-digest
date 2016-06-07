var fcns = {
	ref: function maxWeight(qi) {
		return 4 * 100 / 10 * Math.sqrt(qi * (1-qi))

	},
	p5p: function p5p(qi) {
		return 20 * Math.pow(qi - 0.5, 5) - 2 * (qi - 0.5)
	},
	p7p: function p7p(qi) {
		return 80 * Math.pow(qi - 0.5, 7) - 2 * (qi - 0.5)
	},
	p5m: function p5p(qi) {
		var r = qi - 0.5
		return 20*r*r*r*r*r - 2*r
	},
	p7m: function p5p(qi) {
		var r = qi - 0.5
		return (80*r*r*r*r*r*r - 2) * r
	}
}

var keys = Object.keys(fcns)
var res = {}
keys.forEach((k)=>{res[k]=0})
var sum = 0

for (var i=0; i<keys.length; ++i) {
	var st = process.hrtime()
	for (var j=0; j<1000; ++j) {
		sum += fcns[keys[i]](i/1000)
	}
	var et = process.hrtime()
	res[keys[i]] += (et[0]-st[0])*1e-9 + et[1]-st[1]

}
console.log(JSON.stringify(res))
console.log('SUM '+sum)
