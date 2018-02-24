/**
 * @param {*} vs
 * @param {*} rs
 * @param {*} put
 * @param {*} pop
 * @return {void}
 */
module.exports = function(vs, rs, put, pop) {
	var i = pop,
			j = pop
	// shift right [put]>>>[pop]
	if (pop > put) while(i > put) { //ends with i == put
		j = i--
		vs[j] = vs[i]
		rs[j] = rs[i]
	}
	// shift left [pop]<<<[put]
	else while(j < put) { //ends with pop == put-1
		i = j++
		vs[i] = vs[j]
		rs[i] = rs[j]
	}
}
