/**
 * Remove point k (Vi, Vj, Vl, Vm, Ri, Rm unchanged)
 * ∑ r'[i]*(v'[i] + v'[i-1]) = ∑ r[i]*(v[i] + v[i-1])
 * rj'(vj+vi) + rk'(vk'+vj) + rl'(vl+vk') + rm'(vm+vl) = rj(vj+vi) + rk(vk+vj) + rl(vl+vk) + rm(vm+vl)
 *
 * remove k:
 * rk' = 0
 * vk'=vj
 * Δj = Rj'-Rj
 * Δl = Rl'- Rl
 *
 * rj' = rj + Δj
 * rk' = 0
 * rl' = rk + rl - Δj + Δl
 * rm' = rm - Δl
 *
 * simplifies to
 * Δj(vj+vi) + (rk+rl-Δj+Δl)(vl+vj) - Δl(vm+vl) = rk(vk+vj) + rl(vl+vk)
 * Δjvi - Δjvl + Δlvj - Δlvm = rkvk + rlvk - rkvl - rlvj
 * Δj(vl-vi) + Δl(vm-vj) = rk(vl-vk) - rl(vk-vj)
 * Δj(vl-vi) + Δl(vm-vj) = rkvl - vk(rk+rl) + rlvj
 *
 * Example:
 * values:[0,1,3,5,6], rs:[2,2,2,2], average=6+0+2(1+4+8+11)/10=30/10=3
 * remove 3, shift 1 (Δl=0): Δj = (rk(vl-vk) + rl(vj-vk))/(vl-vi) = 2(2)+2()
 * values:[0,3,6], ranks:[0,1.5,1.5], average=(6 + 3x1.5 + 9x1.5)/8 = 3!
 *
 * heuristic (move to center)
 * e = (Rk-Rj)(vl-vk) - (Rl-Rk)(vk-vj)
 * if e < 0: Δj = 0; Δl = e/(vm-vj)
 * if e > 0: Δl = 0; Δj = e/(vl-vi)
 *
 * @param {Array<number>} vs
 * @param {Array<number>} rs
 * @param {number} k
 * @return {void}
 */
module.exports = function(vs, rs, k) {
	if (k < 2 || k > rs.length-3) throw Error('Out of range: '+k+' length:'+rs.length)
	var dv = vs[k+1] - vs[k-1]
	if (dv === 0) return
	//e = (rs[k] - rs[k-1])*(vs[k+1]-vs[k]) - (rs[k+1] - rs[k])*(vs[k]-vs[k-1])
	var e = rs[k]*dv - rs[k-1]*(vs[k+1]-vs[k]) - rs[k+1]*(vs[k]-vs[k-1])

	if (isNaN(e)) throw Error('vs:'+vs.join()+' rs:'+rs.join()+' k:'+k)

	if (e > 0) rs[k-1] += e / (vs[k+1]-vs[k-2])
	else if (e < 0) rs[k+1] += e / (vs[k+2]-vs[k-1])

	if (isNaN(rs[k-1])) throw Error('vs:'+vs.join()+' rs:'+rs.join()+' k-1:'+(k-1))
	if (isNaN(rs[k+1])) throw Error('vs:'+vs.join()+' rs:'+rs.join()+' k+1:'+(k+1))
}
