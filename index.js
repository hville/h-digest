var Recorder = require('./src/_cdf'),
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
 * @param	{number|Array<number>} weighting - the compressed length or pdf[any] or cdf[0..1]
 * @return {object} - new sample recorder
 */
module.exports = function(weighting) {
	// a length number
	return new Recorder(
		!Array.isArray(weighting) ? createWeighting(weighting)
		: isCDF(weighting) ? weighting
		: makeCDF(weighting)
	)
}

function isCDF(a) {
	for (var i=1; i<a.length; ++i) if (a[i] < a[i-1]) return false
	return (a[0] === 0 && a[i-1] === 1)
}

function makeCDF(pdf) {
	if (pdf[0]) pdf.unshift(0) //to preserve minimum
	if (pdf[pdf.length-1]) pdf.push(0) //to preserve maximum

	var sum = 0,
			cdf = []
	for (var i=0; i<pdf.length; ++i) sum += pdf[i]
	for (var j=0; j<pdf.length; ++j) cdf[j] = pdf[j] / sum
	return cdf
}
