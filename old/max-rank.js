module.exports = maxRankFactory

/**
 * Factory for the maximum index to target rank getter
 * @param	{number} length - length of the array of ranks
 * @param	{number} first1s - number of initial slots limited to one sample
 * @param	{number} last1s - number of final slots limited to one sample
 * @return {function} - maximum index to target rank getter
 */
function maxRankFactory(length, first1s, last1s) {
	var maxPs = calcMaxPs(length - first1s - last1s),
			last = length - 1
	/**
	 * @param	{number} SampleQty - total number of samples
	 * @param	{number} idx - index of the target maximum
	 * @return {number} - target rank for the given maximum
	 */
	return function maxRank(SampleQty, idx) {
		if (idx < 0 || idx >= SampleQty.length) throw Error('index '+idx+' is out of range')
		return idx < first1s ? idx + 1 // left pad
			: idx > (last - last1s) ? SampleQty - last + idx // right pad
			: first1s + (SampleQty - first1s - last1s - 1) * maxPs[idx-first1s] + 1 // internal curve
	}
}
/**
 * Weighting function to have tighter grouping at the ends for greater quantile accuracy
 * @param	{number} len - length of the array of ranks
 * @param	{number} first1s - number of initial slots limited to one sample
 * @param	{number} last1s - number of final slots limited to one sample
 * @return {function} - weights
 */
function calcMaxPs(len) {
	//TODO weighting is empirical - check error%
	//TODO err% = dp/p |p<0.5 OR dp/(1-p) |p>0.5 OR dp/(p-pp)
	if (len === 1) return [1]
	for (var i = 0, arr = Array(len); i < len; ++i) {
		/** @type {number} scaling r[0] === -1, r[len-1] === +1 */
		var r = 2 * i / (len - 1) - 1
		arr[i] = (r * Math.SQRT2 / Math.sqrt(1 + r*r) + 1) / 2
	}
	return arr
}
