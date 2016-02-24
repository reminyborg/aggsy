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

// newAverage = average + ((value - average) / index)
function _avg (d, curr) {
  d.count++
  d.value = d.value + ((curr - d.value) / d.count)
  return d
}
_avg.initialValue = { value: 0, count: 0 }

// newAverage = average + ((value - average) / index)
function _stdev (d, curr) {
  d.count++
  d.average = d.average + ((curr - d.average) / d.count)
  d.variance = d.variance + ((Math.pow(curr - d.average, 2) - d.variance) / d.count)
  d.value = Math.sqrt(d.variance)
  return d
}
_stdev.initialValue = { value: 0, variance: 0, average: 0, count: 0 }

module.exports = {
  '_sum': _sum,
  '_count': _count,
  '_min': _min,
  '_max': _max,
  '_avg': _avg,
  '_stdev': _stdev
}
