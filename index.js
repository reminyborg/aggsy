var balanced = require('balanced-match')
var debug = require('debug')('aggsy.function')

var functions = {
  '_sum': function (parentPath, params) {
    var path = parentPath + '[\'_sum(' + params + ')\']'
    var value = 'item[\'' + params + '\']'

    var func = 'if (typeof ' + path + ' == \'undefined\') { ' + path + ' = ' + value + '; }\n'
    func += 'else { ' + path + ' += ' + value + '};\n'

    return func
  },

  '_count': function (parentPath) {
    var path = parentPath + '[\'_count()\']'
    var func = 'if (typeof ' + path + ' == \'undefined\') { ' + path + ' = 1; }\n'
    func += 'else { ' + path + '++ };\n'

    return func
  }
}

function aggsy (agg, data) {
  var result = {}

  var funcText = genFunction(agg)
  debug(funcText)
  var func = new Function ('result', 'item', funcText) // eslint-disable-line

  for (var i = 0; i < data.length; i++) {
    func(result, data[i])
  }

  return result
}

function genFunction (agg, func, path) {
  func = func || ''
  path = path || 'result'

  var parsed = balanced('(', ')', agg)

  var pre = parsed.pre

  if (functions[pre]) {
    func += functions[pre](path, parsed.body)
    if (parsed.post) {
      func += genFunction(parsed.post, func, path)
    }
  } else {
    path += '[item[\'' + pre + '\']]'

    if (!parsed.body) {
      func += 'if (!' + path + ') { ' + path + ' = [] };\n'
      func += path + '.push(item);\n'
    } else {
      func += 'if (!' + path + ') { ' + path + ' = {} };\n'
      func += genFunction(parsed.body, func, path)
    }
  }

  return func
}

module.exports = aggsy
