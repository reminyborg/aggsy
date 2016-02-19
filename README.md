# Aggsy

**Work in progress**

Aggsy is a aggregation language for easy use in http query strings

### Installation

You need npm installed:

```sh
$ npm install aggsy
```

### Use

```javascript
var aggsy = require('aggsy')
aggsy(aggsyQuery, arrayOfObjects)
```

### Example

```javascript
var aggsy = require('aggsy')

var cars = [
  { model: 'volvo', km: 100 },
  { model: 'tesla', make: 's', km: 200 },
  { model: 'tesla', make: 's', km: 120 }
]

aggsy('model(_sum(km)_count())', cars)

/* Gives: {
  tesla: { '_count()': 2, '_sum(km)': 320 },
  volvo: { '_count()': 1, '_sum(km)': 100 }
}
*/
```

License
----

MIT
