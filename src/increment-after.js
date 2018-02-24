/**
 * @param {Array<number>} rs
 * @param {number} j
 * @return {void}
 */
module.exports = function(rs, j) {
	while (rs.length > ++j) ++rs[j]
}
