/**
 * Mean preserving value insertion between i and j
 * 2(N+1)μ' = 2Nμ + 2V
 * ∑ r'[i]*(v'[i] + v'[i-1]) = ∑ r[i]*(v[i] + v[i-1]) + 2V
 * r(V + v[i]) + r[j]'(v[j] + V) = r[j](v[j] + v[i]) + 2V
 * with r + r[j]' = r[j] + 1 => r[j]' = r[j] + 1 - r
 * r(V + v[i]) + r[j](v[j] + V) + (v[j] + V) - r(v[j] + V) = r[j](v[j] + v[i]) + 2V
 * rv[i] + r[j]V + v[j] - rv[j] = r[j]v[i] + V
 * r(v[j] - v[i]) =  r[j](V - v[i]) + (v[j] - V)
 * r = ( r[j](V - v[i]) + v[j] - V ) / (v[j] - v[i])
 *
 * Result
 * R = R[i] + ( (R[j]-R[i])(V - v[i]) + v[j] - V ) / (v[j] - v[i])
 * R = (R[i](v[j] - v[i]) + (R[j]-R[i])(V - v[i]) + v[j] - V ) / (v[j] - v[i])
 * R = (R[i](v[j]-V) + R[j](V-v[i]) + v[j] - V ) / (v[j] - v[i])
 *
 * Example:
 * values:[0,6], rs:[0,2], average=(6+12)/6=3
 * new sample V:3 => r = (2( 3 - 0 ) + 6 - 3) / (6 - 0) = 3/2 = 1.5
 * values:[0,3,6], ranks:[0,1.5,1.5], average=(6 + 3x1.5 + 9x1.5)/8 = 3!
 *
 * @param {Array<number>} vs
 * @param {Array<number>} rs
 * @param {number} j
 * @param {number} v
 * @return {number}
 */
module.exports = function(vs,rs,j, v) {
	var dv = vs[j] - vs[j-1]
	return dv === 0 ? j : rs[j-1] + ( (rs[j] - rs[j-1]) * (v - vs[j-1]) + vs[j] - v ) / dv
}
