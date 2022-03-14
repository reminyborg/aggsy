var test = require('tape')
var aggsy = require('./index')

var cars = [
  { model: 'volvo', make: 'v50', seats: 5,  km: 100 },
  { model: 'volvo', make: 'v50', seats: 5, km: 120 },
  { model: 'volvo', make: 'v60', seats: 7, km: 200 },
  { model: 'tesla', make: 's', seats: 7, km: 250 },
  { model: 'tesla', make: 's', seats: 5, km: 120 },
  { model: 'tesla', make: 's', seats: 5, km: 10 },
  { model: 'tesla', make: 'x', seats: 6, km: 20 },
  { model: 'vw', make: 'touran', seats: 7, km: 100 }
]

var carsDot = [
  { model: 'volvo', detail: { make: 'v50', seats: 5 }, km: 100 },
  { model: 'volvo', detail: { make: 'v50', seats: 5 }, km: 120 },
  { model: 'volvo', detail: { make: 'v60', seats: 7 }, km: 200 },
  { model: 'tesla', detail: { make: 's', seats: 7 }, km: 250 },
  { model: 'tesla', detail: { make: 's', seats: 5 }, km: 120 },
  { model: 'tesla', detail: { make: 's', seats: 5 }, km: 10 },
  { model: 'tesla', detail: { make: 'x', seats: 6 }, km: 20 },
  { model: 'vw', detail: { make: 'touran', seats: 7 }, km: 100 }
]

var people = [
  { name: 'Bill', car: 'Toyota', hair: { color: 'white' } },
  { name: 'Jane', car: 'Lexus' },
  { name: 'Bob' }  // car property missing
]

var emptyValue = [
  { foo: 1 },
  { }
]

var funky = [
  { "@type": "https://some.api/ICE", "model": "volvo", "make": "v50", "km": 100 },
  { "@type": "https://some.api/BEV", "model": "tesla", "make": "s", "km": 200 },
  { "@type": "https://some.api/BEV", "model": "tesla", "make": "s", "km": 120 },
  { "@type": "https://some.api/BEV", "model": "tesla", "make": "x", "km": 10 }
]

var funkyResult = {
  "https://some.api/ICE": {
    "distance": 100,
    "reports": 1
  },
  "https://some.api/BEV": {
    "distance": 330,
    "reports": 3
  }
}

var simpleGrouping = { volvo: [ { model: 'volvo', detail: { make: 'v50', seats: 5 }, km: 100 }, { model: 'volvo', detail: { make: 'v50', seats: 5 }, km: 120 }, { model: 'volvo', detail: { make: 'v60', seats: 7 }, km: 200 } ], tesla: [ { model: 'tesla', detail: { make: 's', seats: 7 }, km: 250 }, { model: 'tesla', detail: { make: 's', seats: 5 }, km: 120 }, { model: 'tesla', detail: { make: 's', seats: 5 }, km: 10 }, { model: 'tesla', detail: { make: 'x', seats: 6 }, km: 20 } ], vw: [ { model: 'vw', detail: { make: 'touran', seats: 7 }, km: 100 } ] } 

var simpleAggs = { tesla: { '_count()': 4, '_sum(km)': 400 }, volvo: { '_count()': 3, '_sum(km)': 420 }, vw: { '_count()': 1, '_sum(km)': 100 } }

var dotNotationGrouping = { v50: [ { model: 'volvo', detail: { make: 'v50', seats: 5 }, km: 100 }, { model: 'volvo', detail: { make: 'v50', seats: 5 }, km: 120 } ], v60: [ { model: 'volvo', detail: { make: 'v60', seats: 7 }, km: 200 } ], s: [ { model: 'tesla', detail: { make: 's', seats: 7 }, km: 250 }, { model: 'tesla', detail: { make: 's', seats: 5 }, km: 120 }, { model: 'tesla', detail: { make: 's', seats: 5 }, km: 10 } ], x: [ { model: 'tesla', detail: { make: 'x', seats: 6 }, km: 20 } ], touran: [ { model: 'vw', detail: { make: 'touran', seats: 7 }, km: 100 } ] } 

var dotNotationAggs = { s: { '_count()': 3, '_sum(km)': 380 }, touran: { '_count()': 1, '_sum(km)': 100 }, v50: { '_count()': 2, '_sum(km)': 220 }, v60: { '_count()': 1, '_sum(km)': 200 }, x: { '_count()': 1, '_sum(km)': 20 } }

var namedReducers = { tesla: { distance: 400, reports: 4 }, volvo: { distance: 420, reports: 3 }, vw: { distance: 100, reports: 1 } }

var nestedAggs = { count: 8, tesla: { count: 4, s: { count: 3 }, x: { count: 1 } }, volvo: { count: 3, v50: { count: 2 }, v60: { count: 1 } }, vw: { count: 1, touran: { count: 1 } } }

var flattened = [ { make: 'v50', distance: 220, count_per_make: 2, model: 'volvo', count: 3 }, { make: 'v60', distance: 200, count_per_make: 1, model: 'volvo', count: 3 }, { make: 's', distance: 380, count_per_make: 3, model: 'tesla', count: 4 }, { make: 'x', distance: 20, count_per_make: 1, model: 'tesla', count: 4 }, { make: 'touran', distance: 100, count_per_make: 1, model: 'vw', count: 1 } ]

var simpleFlattened = [ { model: 'volvo', distance: 420, count: 3 }, { model: 'tesla', distance: 400, count: 4 }, { model: 'vw', distance: 100, count: 1 } ]


test('#aggsy', function (t) {
  t.plan(4)
  t.same(aggsy('model()', carsDot), simpleGrouping, 'simple grouping')
  t.same(aggsy('model(_sum(km)_count())', cars), simpleAggs, 'simple aggs')
  t.same(aggsy('model( _sum(km),_count())', cars), simpleAggs, 'commas and spaces')
  t.same(aggsy('model(distance:_sum(km), reports: _count())', cars), namedReducers, 'named reducers')
})

test('#aggsy nested', function (t) {
  t.plan(1)
  t.same(aggsy('model(make(count: _count()), count: _count()), count: _count()', cars), nestedAggs, 'nested aggs')
})

test('#aggsy missing', function (t) {
  t.plan(2)
  t.same(aggsy('car()', people), { Lexus: [ { car: 'Lexus', name: 'Jane' } ], Toyota: [ { car: 'Toyota', hair: { color: 'white' }, name: 'Bill' } ] }, 'default: do not show missing property')
  t.same(aggsy('car()', people, { missing: '_leftovers' }), { Lexus: [ { car: 'Lexus', name: 'Jane' } ], Toyota: [ { car: 'Toyota', hair: { color: 'white' }, name: 'Bill' } ], _leftovers: [ { name: 'Bob' } ] }, 'missing grouping name')
})

test('#aggsy dot notation', function (t) {
  t.plan(3)
  t.same(aggsy('detail.make()', carsDot), dotNotationGrouping, 'dot notation grouping')
  t.same(aggsy('detail.make(_sum(km),_count())', carsDot), dotNotationAggs, 'dot notation aggs')
  t.same(aggsy('hair.color()', people), { white: [ { car: 'Toyota', hair: { color: 'white' }, name: 'Bill' } ] }, 'dot notation value does not exist deep')
})

test('#aggsy flatten', function (t) {
  t.plan(3)
  t.same(aggsy('model(distance: _sum(km), count:_count())', cars, { flatten: true }), simpleFlattened)
  t.same(aggsy('model(make(distance: _sum(km), count_per_make:_count()), count:_count())', cars, { flatten: true }), flattened)
  t.same(aggsy('_flatten(model(distance: _sum(km), count:_count()))', cars), simpleFlattened)
})

test('#reducers', function (t) {
  t.plan(12)
  t.same(aggsy('_sum(km)', cars), { '_sum(km)': 920 }, '_sum')
  t.same(aggsy('_count()', cars), { '_count()': 8 }, '_count')
  t.same(aggsy('_min(km)', cars), { '_min(km)': 10 }, '_min')
  t.same(aggsy('_max(km)', cars), { '_max(km)': 250 }, '_max')
  t.same(aggsy('_first(model)', cars), { '_first(model)': 'volvo' }, '_first')
  t.same(aggsy('_last(model)', cars), { '_last(model)': 'vw' }, '_last')
  t.same(aggsy('_has(model), _has(test)', cars), { '_has(model)': true, '_has(test)': false }, '_has')
  t.same(aggsy('_avg(km)', cars), { '_avg(km)': { count: 8, value: 115.00000000000001 } }, '_avg')
  t.same(aggsy('_stdev(km)', cars), { '_stdev(km)': { average: 115.00000000000001, count: 8, value: 67.84457955963455, variance: 4602.886975623584 } }, '_stdev')
  t.same(aggsy('_static(test test)', cars), { '_static(test test)': 'test test' }, '_static')

  t.same(aggsy('foo: _sum(foo)', emptyValue), { 'foo': 1 })

  t.same(aggsy('_last_one(km), _max(km)', cars, {
    reducers: { '_last_one': function (prev, curr) { return curr } }
  }), { '_last_one(km)': 100, '_max(km)': 250 }, 'custom reducer')
})

test('#funky', function (t) {
  t.plan(1)
  t.same(aggsy('@type(distance: _sum(km), reports: _count())', funky),funkyResult)
})

test('#bad', function (t) {
  t.plan(2)
  t.same(aggsy('model(distance: _sum(foo",(()=>{while(true){}})(),"))', cars), { volvo: { distance: 0 }, tesla: { distance: 0 }, vw: { distance: 0 } })
  t.same(aggsy('mo"del"(distance: _count())', cars), { volvo: { distance: 3 }, tesla: { distance: 4 }, vw: { distance: 1 } }) 
})
