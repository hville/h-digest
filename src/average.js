/**
 * Mean preserving continuous approximation
 * μ = ( v[0] + v[M] + ∑ ( R[j] - R[i] )( v[j] + v[i] ) ) / 2N
 * μ = ( v[M](N+1) + ∑ ( R[j]v[i] - R[i]v[j] ) ) / 2N
 * μ = ( v[0] + v[M] + ∑ r[j](v[j] + v[i]) ) / 2N` where `r[j] = R[j] - R[i]
 * @param {Array<number>} vs
 * @param {Array<number>} rs
 * @return {number}
 */
module.exports = function(vs, rs) {
	var M = rs.length
	for (var j=1, s=vs[0] + vs[M-1]; j<M; ++j) s += (rs[j] - rs[j-1]) * (vs[j] + vs[j-1])
	return s / 2 / rs[M-1]
}
