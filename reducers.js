function _sum (prev, curr) {
  return prev + curr
}
_sum.initialValue = 0

function _count (prev, curr) {
  return prev + 1
}
_count.initialValue = 0

function _min (prev, curr) {
  if (prev > curr) return curr
  else return prev
}

function _max (prev, curr) {
  if (prev < curr) return curr
  else return prev
}

module.exports = {
  '_sum': _sum,
  '_count': _count,
  '_min': _min,
  '_max': _max
}
