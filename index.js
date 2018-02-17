var Recorder = require('./src/_match-ranks'),
		createWeighting = require('./src/weighting')

/**
 * Inpired by https://github.com/tdunning/t-digest
 * and by https://www.npmjs.com/package/tdigest
 */

/**
 * Quantile function approximation for (almost) infinite stream of samples
 * (up to 2^53 - 1 ~ 9e15)
 *
 * If a length is provided, the internal weighting function is used
 * If a cdf array is provided ([0..1]) it is used as-is
 * Any other array is interpreted as relative weights to be summed and scaled to [0..1]
 *
 * @param	{number|array} weighting - the compressed length or pdf[any] or cdf[0..1]
 * @return {object} - new sample recorder
 */
module.exports = function(weighting) {
	// a length number
	if (!Array.isArray(weighting)) return new Recorder(createWeighting(weighting))
	// a cdf
	if (weighting.every(function(v,i,a) { return i ? (v >= a[i-1] && v <= 1) : v >= 0 })) {
		return new Recorder(weighting)
	}
	// a pdf
	if (weighting[0]) weighting.unshift(0) //to preserve minimum
	if (weighting[weighting.length-1]) weighting.push(0) //to preserve maximum

	var sum = 0,
			cdf = []
	for (var i=0; i<weighting.length; ++i) sum += weighting[i]
	for (var j=0; j<weighting.length; ++j) cdf[j] = weighting[j] / sum
	return new Recorder(cdf)
}
