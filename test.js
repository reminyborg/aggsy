var test = require('tape')
var aggsy = require('./index')

var cars = [
  { model: 'volvo', detail: { make: 'v50' }, km: 100 },
  { model: 'volvo', detail: { make: 'v50' }, km: 120 },
  { model: 'volvo', detail: { make: 'v60' }, km: 200 },
  { model: 'tesla', detail: { make: 's' }, km: 250 },
  { model: 'tesla', detail: { make: 's' }, km: 120 },
  { model: 'tesla', detail: { make: 's' }, km: 10 },
  { model: 'tesla', detail: { make: 'x' }, km: 20 },
  { model: 'vw', detail: { make: 'touran' }, km: 100 }
]

var simpleGrouping = { tesla: [ { detail: { make: 's' }, km: 250, model: 'tesla' }, { detail: { make: 's' }, km: 120, model: 'tesla' }, { detail: { make: 's' }, km: 10, model: 'tesla' }, { detail: { make: 'x' }, km: 20, model: 'tesla' } ], volvo: [ { detail: { make: 'v50' }, km: 100, model: 'volvo' }, { detail: { make: 'v50' }, km: 120, model: 'volvo' }, { detail: { make: 'v60' }, km: 200, model: 'volvo' } ], vw: [ { detail: { make: 'touran' }, km: 100, model: 'vw' } ] }

var simpleAggs = { tesla: { '_count()': 4, '_sum(km)': 400 }, volvo: { '_count()': 3, '_sum(km)': 420 }, vw: { '_count()': 1, '_sum(km)': 100 } }

var dotNotationGrouping = { s: [ { detail: { make: 's' }, km: 250, model: 'tesla' }, { detail: { make: 's' }, km: 120, model: 'tesla' }, { detail: { make: 's' }, km: 10, model: 'tesla' } ], touran: [ { detail: { make: 'touran' }, km: 100, model: 'vw' } ], v50: [ { detail: { make: 'v50' }, km: 100, model: 'volvo' }, { detail: { make: 'v50' }, km: 120, model: 'volvo' } ], v60: [ { detail: { make: 'v60' }, km: 200, model: 'volvo' } ], x: [ { detail: { make: 'x' }, km: 20, model: 'tesla' } ] }

var dotNotationAggs = { s: { '_count()': 3, '_sum(km)': 380 }, touran: { '_count()': 1, '_sum(km)': 100 }, v50: { '_count()': 2, '_sum(km)': 220 }, v60: { '_count()': 1, '_sum(km)': 200 }, x: { '_count()': 1, '_sum(km)': 20 } }

var namedReducers = { tesla: { distance: 400, reports: 4 }, volvo: { distance: 420, reports: 3 }, vw: { distance: 100, reports: 1 } }

test('#aggsy', function (t) {
  t.plan(6)
  t.same(aggsy('model()', cars), simpleGrouping, 'simple grouping')
  t.same(aggsy('model(_sum(km)_count())', cars), simpleAggs, 'simple aggs')
  t.same(aggsy('model( _sum(km),_count())', cars), simpleAggs, 'commas and spaces')
  t.same(aggsy('detail.make()', cars), dotNotationGrouping, 'dot notation grouping')
  t.same(aggsy('detail.make(_sum(km),_count())', cars), dotNotationAggs, 'dot notation aggs')
  t.same(aggsy('model(distance:_sum(km), reports: _count())', cars), namedReducers, 'named reducers')
})

test('#reducers', function (t) {
  t.plan(5)
  t.same(aggsy('_sum(km)', cars), { '_sum(km)': 920 }, '_sum')
  t.same(aggsy('_count()', cars), { '_count()': 8 }, '_count')
  t.same(aggsy('_min(km)', cars), { '_min(km)': 10 }, '_min')
  t.same(aggsy('_max(km)', cars), { '_max(km)': 250 }, '_max')

  var reducers = {
    '_last': function (prev, curr) { console.log(curr); return curr }
  }
  t.same(aggsy('_last(km), _max(km)', { reducers: reducers }, cars), { '_last(km)': 100, '_max(km)': 250 }, 'custom reducer')
})
