var balanced = require('balanced-match')
var debug = require('debug')('aggsy.function')

var leading = /(^[\s*,]+)/

var functions = {
  '_sum': function (parentPath, params) {
    var name = '_sum(' + params + ')'
    var path = parentPath + '["' + name + '"]'
    var value = 'item' + propPath(params)

    var func = '// ' + '_sum(' + params + ')\n'
    func += 'if (typeof ' + path + ' === \'undefined\') { ' + path + ' = ' + value + '; }\n'
    func += 'else { ' + path + ' += ' + value + '; }\n\n'

    return func
  },

  '_count': function (parentPath) {
    var name = '_count()'
    var path = parentPath + '["' + name + '"]'

    var func = '// ' + name + '\n'
    func += 'if (typeof ' + path + ' === "undefined") { ' + path + ' = 1; }\n'
    func += 'else { ' + path + '++; }\n\n'

    return func
  }
}

function aggsy (agg, data) {
  debug(agg)
  var funcText = genFunction(agg)
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
  return '["' + path.split(".").join('"]["') + '"]' 
}

function genFunction (agg, path) {
  var func = '\n'
  path = path || 'result'

  var parsed = balanced('(', ')', agg)

  var pre = parsed.pre.replace(leading, '')

  if (functions[pre]) {
    func += functions[pre](path, parsed.body)
    if (parsed.post) {
      func += genFunction(parsed.post, path)
    }
  } else {
    func += '// ' + pre + '\n'
    path += '[item' + propPath(pre) + ']'

    if (!parsed.body) {
      func += 'if (!' + path + ') { ' + path + ' = []; }\n'
      func += path + '.push(item);\n\n'
    } else {
      func += 'if (!' + path + ') { ' + path + ' = {}; }\n\n'
      func += genFunction(parsed.body, path)
    }
  }

  return func
}

module.exports = aggsy
