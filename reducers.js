function _sum (prev, curr) {
  if (typeof curr === 'undefined') return prev
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

function _first (prev, curr) {
  if (!prev) return curr
  else return prev
}

function _last (prev, curr) {
  return curr
}

function _has (prev, curr) {
  if (!prev) return !!curr
  else return prev
}
_has.initialValue = false

// newAverage = average + ((value - average) / index)
function _avg (d, curr) {
  if (typeof curr === 'undefined') return d
  d.count++
  d.value = d.value + ((curr - d.value) / d.count)
  return d
}
_avg.initialValue = { value: 0, count: 0 }

// newAverage = average + ((value - average) / index)
function _stdev (d, curr) {
  if (typeof curr === 'undefined') return d
  d.count++
  d.average = d.average + ((curr - d.average) / d.count)
  d.variance = d.variance + ((Math.pow(curr - d.average, 2) - d.variance) / d.count)
  d.value = Math.sqrt(d.variance)
  return d
}
_stdev.initialValue = { value: 0, variance: 0, average: 0, count: 0 }

function _static (prev, curr, prop) {
  return prop
}
_static.initialValue = ''

module.exports = {
  '_sum': _sum,
  '_count': _count,
  '_min': _min,
  '_max': _max,
  '_first': _first,
  '_last': _last,
  '_has': _has,
  '_avg': _avg,
  '_stdev': _stdev,
  '_static': _static
}
