function _sum (prev, curr) {
  return prev + curr
}
_sum.initialValue = 0

function _count (prev, curr) {
  return prev + 1
}
_count.initialValue = 0

module.exports = {
  '_sum': _sum,
  '_count': _count
}
