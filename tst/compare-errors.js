/* eslint no-console:0 */
var quantile = require('sample-quantile')
var tdigest = require('tdigest')
var hdigest = require('../')

var normz = require('random-z')

var Ns = [1000, 2000, 4000, 8000, 10000],
		Ms = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
		ERR2 = {},
		BIAS = {},
		percentages = [0.02, .1, .25, .5, .75, .98]

function createSamples(N) {
	var unif = mapRep(N, function() { return Math.random() * 100 }),
			norm = mapRep(N, function() { return normz() * 100 }),
			logp = mapRep(N, function() { return Math.exp(normz()+0.5) * 100 })
	return {
		logp: logp,
		logn: logp.map(function(v) { return -v }),
		norm: norm,
		disc: norm.map(Math.floor),
		sort: unif.slice().sort(sorter),
		rvrs: unif.slice().sort(sorter).reverse()
	}
}
function createSamplers(M) {
	return {
		td1: new tdigest.TDigest(0.8, M, 1.1),
		hd1: hdigest(M)
	}
}
function getActuals(rnds) {
	return Object.keys(rnds).reduce(function(r, k) {
		r[k] = quantile(rnds[k].slice().sort(sorter), percentages)
		return r
	}, {})
}

//console.profile('build')
console.log('\n\n=== COMPARE ERRORS ===')
Ns.forEach(function(N) {
	Ms.forEach(function(M) {
		var samples = createSamples(N),
				actuals = getActuals(samples)

		Object.keys(samples).forEach(function(sName) {
			var estimators = createSamplers(M),
					sample = samples[sName]

			Object.keys(estimators).forEach(function(eName) {
				var estimator = estimators[eName]
				if (BIAS[eName] === undefined) {
					BIAS[eName] = 0
					ERR2[eName] = 0
				}
				sample.forEach(function(v) { estimator.push(v) })
				var sum = 0,
						sumsq = 0
				percentages.forEach(function(q, i) {
					var e = estimator.percentile(q) - actuals[sName][i]
					sum += e
					sumsq += e*e
				})
				BIAS[eName] += sum/percentages.length
				ERR2[eName] += sumsq/percentages.length
			})
		})
	})
})


Object.keys(ERR2).sort(function(a,b) {return ERR2[a]-ERR2[b]}).forEach(function(fName) {
	console.log(
		fName,
		'Bias:', BIAS[fName].toFixed(0), ///N
		'RMS:', (Math.sqrt(ERR2[fName])).toFixed(0) //N
	)
})

// UTILS
function mapRep(n, f) {
	for (var i=0, r=Array(n); i<n; ++i) r[i] = f(n, i, r)
	return r
}
function sorter(a, b) {
	return a-b
}
