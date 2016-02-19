# Aggsy

**Work in progress**

Aggsy is a aggregation language for easy use in http query strings

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

### Installation

You need npm installed:

```sh
$ npm install aggsy
```

### Use

```javascript
var aggsy = require('aggsy')
aggsy(query, array)
```

### Example

```javascript
var aggsy = require('aggsy')

var cars = [
  { model: 'volvo', km: 100 },
  { model: 'tesla', make: 's', km: 200 },
  { model: 'tesla', make: 's', km: 120 }
]

aggsy('model(_sum(km),_count())', cars)

/* Gives: {
  tesla: { '_count()': 2, '_sum(km)': 320 },
  volvo: { '_count()': 1, '_sum(km)': 100 }
}
*/
```

### Advanced use

If you call aggsy with only the query parameter it returns an aggregate function.
This can be used in flexible ways.

The aggregate function takes a mutable object and one item as parameters

```javascript
var aggregate = aggsy(query)

var result = {}

array.forEach(function (item) {
  aggregate(result, item)
})

// result will be the aggregated result

```

### Query language

**language description to come**

License
----

MIT
