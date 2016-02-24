var balanced = require('balanced-match')
var debug = require('debug')('aggsy')

var leading = /^[\s,]+/
var findName = /^[\w.]+(?=:)/

var defaultReducers = require('./reducers')

function aggsy (query, data, options) {
  debug(query)
  if (Object.prototype.toString.call(data) !== '[object Array]') {
    options = data
    data = undefined
  }

  options = options || {}

  var reducers = options.reducers || defaultReducers
  if (options.reducers) {
    for (var n in defaultReducers) {
      if (!reducers[n]) reducers[n] = defaultReducers[n]
    }
  }

  var funcText = '\n// reducers\n'

  for (var name in reducers) {
    if (typeof reducers[name] !== 'function') { throw new Error('reducers must be functions') }
    if (query.indexOf(name) !== -1) {
      funcText += 'var ' + name + ' = ' + reducers[name].toString() + '\n'
    }
  }

  funcText += genFunction(query, reducers)
  debug(funcText)
  var func = new Function ('result', 'item', funcText) // eslint-disable-line

  if (!data) {
    return func
  }

  var result = {}

  for (var i = 0; i < data.length; i++) {
    func(result, data[i])
  }

  return result
}

function propPath (path) {
  return '["' + path.split('.').join('"]["') + '"]'
}

function genFunction (agg, reducers, path) {
  var func = '\n'
  path = path || 'result'

  var parsed = balanced('(', ')', agg)
  if (!parsed) {
    throw new Error('aggsy query faulty. check if used reducers are defined')
  }

  var pre = parsed.pre.replace(leading, '')

  // if named function store and remove name
  var name = findName.exec(pre)
  if (name) {
    name = name[0]
    pre = pre.substring(name.length + 1).trim()
  }

  if (reducers[pre]) {
    // find and add reducer
    if (!name) {
      name = pre + '(' + parsed.body + ')'
    }
    var params = [path + '["' + name + '"]']
    if (parsed.body) { params.push('item' + propPath(parsed.body)) }

    func += '// ' + name + '\n'
    func += 'if (typeof ' + params[0] + ' === "undefined") '
    if (typeof reducers[pre].initialValue !== 'undefined') {
      var initialParams = params.slice(1)
      initialParams.unshift(JSON.stringify(reducers[pre].initialValue))
      func += params[0] + ' = ' + pre + '(' + initialParams.join(', ') + ')\n'
    } else {
      func += params[0] + ' = ' + params[1] + '\n'
    }

    func += 'else ' + params[0] + ' = ' + pre + '(' + params.join(', ') + ')\n'
    if (parsed.post) {
      // more to parse
      func += genFunction(parsed.post, reducers, path)
    }
  } else {
    func += '// ' + pre + '\n'
    path += '[item' + propPath(pre) + ']'

    if (!parsed.body) {
      // no reducers defined then return all items in grouping
      func += 'if (!' + path + ') { ' + path + ' = [] }\n'
      func += path + '.push(item);\n'
    } else {
      // reducers defined, more to parse
      func += 'if (!' + path + ') { ' + path + ' = {} }\n'
      func += genFunction(parsed.body, reducers, path)
    }
  }

  return func
}

module.exports = aggsy
