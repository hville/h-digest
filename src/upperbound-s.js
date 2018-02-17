// binary search ∑[i] >= v
module.exports = function(arr, v) {
	for (var i=0, s=0; i<arr.length; ++i) if ((s += arr[i]) >= v) break
	return i
}
