var Benchmark = require('benchmark')
var benchmarks = require('beautify-benchmark')
var series = require('async-series')
var aggsy = require('./index')

series([
  aggsyCreate,
  aggsyRun
], function () {})

function aggsyCreate (done) {
  var createFunc = new Benchmark.Suite()
  createFunc.add('aggsy create# one group', function () {
    aggsy('model()')
  })
  .add('aggsy create# one reducer', function () {
    aggsy('_sum()')
  })
  .add('aggsy create# groups and reducers', function () {
    aggsy('model(make(_sum(km)), _sum(km), _avg(km))')
  })
  .add('aggsy create# more groups and reducers', function () {
    aggsy('model(make(_sum(km)), _sum(km), _avg(km)), mark(_max(fuel), _min(fuel))')
  })
  .on('cycle', function (event) {
    benchmarks.add(event.target)
  })
  .on('complete', function () {
    benchmarks.log()
    benchmarks.reset()
    if (done) done()
  })
  .run()
}

function aggsyRun (done) {
  var data = Array(100000).fill({ model: 'tesla', make: 's', km: 10 })
  var createFunc = new Benchmark.Suite()
  createFunc.add('aggsy run# one group', function () {
    aggsy('model()', data)
  })
  .add('aggsy run# one reducer', function () {
    aggsy('_sum()', data)
  })
  .add('aggsy run# groups and reducers', function () {
    aggsy('model(make(_sum(km)), _sum(km), _avg(km))', data)
  })
  .on('cycle', function (event) {
    benchmarks.add(event.target)
  })
  .on('complete', function () {
    benchmarks.log()
    benchmarks.reset()
    if (done) done()
  })
  .run()
}
