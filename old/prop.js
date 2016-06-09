function Tst1() {
	var N = 0
	return Object.defineProperty(this, {
		get: function() {	return N }
	})
}
Tst1.prototype.N2 = function() {
	return this.N * this.N
}


function Tst2() {
	var N = 0
	return Object.defineProperty(this, {
		get: function() {	return N }
	})
}
Tst2.prototype = {
	get N2() { return this.N * this.N }
}


function Tst3() {
	var N = 0
	return Object.defineProperty(this, {
		get: function() {	return N }
	})
}
Object.defineProperty(Tst3.prototype, 'N2', {
	get: function() {	return this.N * this.N }
})
