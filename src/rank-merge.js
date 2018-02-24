/**
 * Mean preserving value merge at j
 * 2(N+1)μ' = 2Nμ + 2V
 * ∑ r'[i]*(v'[i] + v'[i-1]) = ∑ r[i]*(v[i] + v[i-1]) + 2V
 * rj'(vj + vi) + rk'(vk + vj) = rj(vj + vi) + rk(vk + vj) + 2V
 * with `rj' = rj + Δj` and `rk' = rk + 1 - Δj
 * (rj + Δj)(vj + vi) + (rk + 1 - Δj)(vk + vj) = rj(vj + vi) + rk(vk + vj) + 2V
 * Δj(vj + vi) + (1 - Δj)(vk + vj) = 2V
 *
 * Δj = (vk + vj - 2V) / (vk - vi)
 *
 * Example:
 * values:[0,3,6] add 3, rs:[1,1,1], average=3
 * Δj = (6 + 3 - 6) / 6 = 0.5
 * new ranks rs:[1,1.5,1.5], average=(0+6+1.5*(3+9))/2/(1.5+1.5+1) = 24/8 = 3!
 *
 * if vk === vi
 * vi + vj = 2V


 *
 * @param {Array<number>} vs
 * @param {Array<number>} rs
 * @param {number} j
 * @param {number} v
 * @return {void}
 */
module.exports = function(vs, rs, j, v) {
	var dv = vs[j+1] - vs[j-1]
	rs[j] += dv ? (vs[j+1] + vs[j] - v - v) / dv : 1
	if (isNaN(rs[j])) throw Error('vs:'+vs.join()+' rs:'+rs.join()+' j:'+j+' val:'+v)
	while (rs.length > ++j) ++rs[j]
}
