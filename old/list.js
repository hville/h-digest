module.exports = List

function List(comparator) {
	this.array = []
	this.comparator = comparator || function(a,b) { return a-b }
}
List.prototype.insert = function(val) {
	this.array.push(val)
	if (arguments.length > 1) for (var i=1; i<arguments.length; ++i) this.array.push(arguments[i])
	this.array.sort(this.comparator)
	return this
}
List.prototype.clear = function() {
	this.array.length = 0
}
List.prototype.merge = function(list) {
	var arr = Array.isArray(list) ? list
		: list instanceof List ? list.array
		: undefined
	if (!arr) throw Error(list.toString+' is not a valid Array or List')
	Array.prototype.push.apply(this.array, arr)
	this.array.sort(this.comparator)
	return this
}
/*List.prototype.replace = function(fcn) { //fcn(val, idx, arr)
	for (var i=0, arr=[]; i<this.array.length; ++i) {
		var res = fcn(this.array[i], i, this.array)
		if (res !== undefined) arr.push(res)
	}
	this.array = arr.sort(this.comparator)
	return this
}*/
//List.prototype.forEach = function() {}
//List.prototype.map = function() {}
//List.prototype.reduce = function() {} // .reduceRight()
//List.prototype.filter = function() {}
//List.prototype.values = function() {} => .next() => {value, done}
Object.defineProperty(List.prototype, 'size', {
	//configurable: false
	//writable: false
	//value: undefined
	get: function() { return this.array.length },
	//set: undefined
	enumerable: true
})
Object.defineProperty(List.prototype, 'min', {
	//configurable: false
	//writable: false
	//value: undefined
	get: function() { return this.array[0] },
	//set: undefined
	enumerable: true
})
Object.defineProperty(List.prototype, 'max', {
	//configurable: false
	//writable: false
	//value: undefined
	get: function() { return this.array[this.array.length-1] },
	//set: undefined
	enumerable: true
})
