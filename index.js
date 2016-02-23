var balanced = require('balanced-match')
var debug = require('debug')('aggsy.function')

var leading = /^[\s,]+/
var findName = /^[\w.]+(?=:)/

var reducers = require('./reducers')

function aggsy (agg, data) {
  debug(agg)
  var funcText = '\n'

  for (var name in reducers) {
    if (typeof reducers[name] !== 'function') { throw new Error('reducers must be functions') }
    funcText += reducers[name].toString() + '\n'
  }

  funcText += genFunction(agg)
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

function genFunction (agg, path) {
  var func = '\n'
  path = path || 'result'

  var parsed = balanced('(', ')', agg)

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
    if (typeof reducers[pre].initialValue !== 'undefined') {
      func += 'if (typeof ' + params[0] + ' === "undefined") { ' + params[0] + ' = ' + reducers[pre].initialValue + ' }\n'
    }
    func += params[0] + ' = ' + pre + '(' + params.join(', ') + ')\n'
    if (parsed.post) {
      // more to parse
      func += genFunction(parsed.post, path)
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
      func += genFunction(parsed.body, path)
    }
  }

  return func
}

module.exports = aggsy
