# Aggsy

Aggsy is a aggregation language/module for easy use in http query strings

Try it online at https://aggsyplay.reminyborg.com

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Installation

You need npm installed:

```sh
$ npm install aggsy
```

## Example

```javascript
var aggsy = require('aggsy')

var cars = [
  { model: 'volvo', make: 'v50', km: 100 },
  { model: 'tesla', make: 's', km: 200 },
  { model: 'tesla', make: 's', km: 120 },
  { model: 'tesla', make: 'x', km: 10 }
]

aggsy('model(distance: _sum(km), reports: _count())', cars)

// Gives:
{
  tesla: { reports: 2, distance: 330 },
  volvo: { reports: 1, distance: 100 }
}


// You may also flatten the results
aggsy('model(distance: _sum(km), reports: _count())', cars, { flatten: true })

// Gives:
[
  { model: 'tesla', reports: 2, distance: 330 },
  { model: 'volvo', reports: 1, distance: 100 }
]
```

*To aggregate on nested groups*
```javascript
aggsy('model(make(count: _count()), count: _count())', cars)

// Gives:
{
  tesla: {
    's': { 'count': 2 },
    'x': { 'count': 1 },
    'count': 3
  },
  volvo: {
    'v50': { 'count': 1 },
    'count': 1
  }
}

// Flatten
aggsy('model(make(count: _count()), 'make.count': _count())', cars, { flatten: true })

// Gives:
[
  { model: 'tesla' make: 's', 'make.count': 2, count: 3 },
  { model: 'tesla' make: 'x', 'make.count': 1, count: 3 },
  { model: 'volvo': make: 'v50', 'make.count': 1, count: 1 }
}
```

## Aggsy(query[, data, options])

When run with an aggsy query and array of objects the aggregated results is returned.

When run with only an query will return an [aggregate function](#advanced use)

Following options are available:
* `reducers` - optional list of [custom reducers](#custom reducers)
* `missing` - (default: `false`) grouping name to put items where grouping property does not exits
* `flatten` - (default: `false`) flatten result (may also be set with `_flatten(query)`)

## Query language

### Grouping

Given a structure
```javascript
{ model: 'volvo', details: { make: 'v50' }, km: 100 }
```
To group on `model` use `model()``
```javascript
{ volvo: [/* items with model: volvo */] }
```
To group on `make` use dot notation `details.make()``
```javascript
{ v50: [/* items with details.make: v50 */] }
```

If no reducers or nested groups are defined within a group ex: `model()` all the items are returned in the groups

### Options

#### Flatten 
**_flatten(query)**

Sets the flatten value so you get flat results

### Reducers

#### Sum
**_sum(property)**
*Int*

#### Count
**_count()**
*Int*

#### Min
**_min(property)**
*Int*

#### Max
**_max(property)**
*Int*

#### First
**_first(property)**

#### Last
**_last(property)**

#### Has
**_has(property)**
*Bool*

#### Average / Mean
**_avg(property)**
*{ value: 0, count: 0 }*

#### Standard deviation
**_stdev(property)**
*{ value: 0, variance: 0, average: 0, count: 0 }*

#### Static String
**_static(string)**
*String*

### Naming reducers

If only supplied with `_sum(km)` the result would be `{ '_sum(km)': 100 }`

Reducers can be named with the convention `distance: _sum(km)` the result then would be `{ 'distance': 100 }`

### Custom reducers

You can add a list of custom reducers to the aggsy `options` object.

A reducer function behaves like javascript [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
but only the `previousValue` and `currentValue` is supplied to the reducer function.
If you want to define an `initialValue` it must be added as a function property.

```javascript
function _myownsum (prev, curr) { return prev + curr }
_myownsum.initialValue = 0
var options = { reducers: { '_myowsum': _myowsum } }

aggsy('_myownsum(km)', data, options)
// or
var aggregate = aggsy('_myownsum(km)', options)
```

License
----

MIT
