var test = require('tape')
var aggsy = require('./index')

var cars = [
  { model: 'volvo', make: 'v50', km: 100 },
  { model: 'volvo', make: 'v50', km: 120 },
  { model: 'volvo', make: 'v60', km: 200 },
  { model: 'tesla', make: 's', km: 250 },
  { model: 'tesla', make: 's', km: 120 },
  { model: 'tesla', make: 's', km: 10 },
  { model: 'tesla', make: 'x', km: 20 },
  { model: 'vw', make: 'touran', km: 100 }
]

var simpleGrouping = { tesla: [ { km: 250, make: 's', model: 'tesla' }, { km: 120, make: 's', model: 'tesla' }, { km: 10, make: 's', model: 'tesla' }, { km: 20, make: 'x', model: 'tesla' } ], volvo: [ { km: 100, make: 'v50', model: 'volvo' }, { km: 120, make: 'v50', model: 'volvo' }, { km: 200, make: 'v60', model: 'volvo' } ], vw: [ { km: 100, make: 'touran', model: 'vw' } ] }
var simpleAggs = { tesla: { '_count()': 4, '_sum(km)': 400 }, volvo: { '_count()': 3, '_sum(km)': 420 }, vw: { '_count()': 1, '_sum(km)': 100 } }

test('#aggsy', function (t) {
  t.plan(2)
  t.same(aggsy('model()', cars), simpleGrouping, 'simple grouping')
  t.same(aggsy('model(_sum(km)_count())', cars), simpleAggs, 'simple aggs')
})
